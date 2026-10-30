#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de sincronizare automată a unei lecții din depozitul de producție (05_materiale)
către Portalul Web pentru Elevi (Portal-Elevi).

Reguli de sincronizare:
  1. Copiază "simulari/simulator.html" -> în "clasa-<clasa>/<modul>/<lectie>/simulator.html".
  2. Copiază toate fișierele "iesire/elev/*.pdf" -> în "clasa-<clasa>/<modul>/<lectie>/*.pdf".
  3. Elimină automat nivelul de an școlar (ex. "2026-2027") din calea destinație.
  4. Ignoră complet directorul "iesire/profesor/".

Utilizare:
  python sincronizeaza_lectie.py "D:\01.WorkspaceCLAUDE\echipa-didactica-constructie\05_materiale\2026-2027\clasa-IX\CAIP-Ochiul-electronistului\CAIP-Z2-tensiune-curent-ohm"
"""

import argparse
import re
import shutil
import sys
from pathlib import Path

PORTAL_ROOT = Path(__file__).resolve().parent


def extrage_cod_lectie(nume_folder: str) -> str:
    """
    Extrage codul scurt al lecției din numele complet al folderului de producție.
    Exemplu: 'CAIP-Z2-tensiune-curent-ohm' -> 'CAIP-Z2'
    """
    potrivire = re.match(r"^([A-Za-z0-9ȘȚĂÎÂșțăîâ]+-[A-Za-z]*\d+)(?:-.+)?$", nume_folder)
    if potrivire:
        return potrivire.group(1)
    return nume_folder


def determina_cale_destinatie(cale_sursa: Path, pastreaza_nume_complet: bool = False) -> Path:
    """
    Determină calea directă în Portal-Elevi sub forma: clasa-<clasa>/<modul>/<lectie>/
    fără prefixul de an școlar (ex. '2026-2027').
    """
    parti = list(cale_sursa.parts)

    # Căutăm direct segmentul care începe cu 'clasa-'
    index_clasa = None
    for idx, parte in enumerate(parti):
        if parte.lower().startswith("clasa-"):
            index_clasa = idx
            break

    if index_clasa is not None:
        parti_relative = parti[index_clasa:]
    else:
        # Fallback: căutăm '05_materiale' și eliminăm eventualul an școlar 'YYYY-YYYY'
        index_mat = next((i for i, p in enumerate(parti) if p.lower() == "05_materiale"), None)
        if index_mat is not None and index_mat + 1 < len(parti):
            parti_relative = parti[index_mat + 1 :]
        else:
            parti_relative = parti[-3:] if len(parti) >= 3 else [cale_sursa.name]

        if parti_relative and re.match(r"^\d{4}-\d{4}$", parti_relative[0]):
            parti_relative = parti_relative[1:]

    if not pastreaza_nume_complet and parti_relative:
        parti_relative[-1] = extrage_cod_lectie(parti_relative[-1])

    return PORTAL_ROOT.joinpath(*parti_relative)


def sincronizeaza_lectie(cale_lectie_str: str, pastreaza_nume_complet: bool = False) -> int:
    cale_sursa = Path(cale_lectie_str.strip('"').strip("'")).resolve()

    if not cale_sursa.exists() or not cale_sursa.is_dir():
        print(f"[EROARE] Folderul lecției sursă nu există: {cale_sursa}", file=sys.stderr)
        return 1

    if "profesor" in [p.lower() for p in cale_sursa.parts]:
        print("[EROARE] Directorul 'iesire/profesor/' este restricționat și nu poate fi sincronizat.", file=sys.stderr)
        return 1

    cale_destinatie = determina_cale_destinatie(cale_sursa, pastreaza_nume_complet)
    cale_destinatie.mkdir(parents=True, exist_ok=True)

    print("=" * 72)
    print("[SINCRONIZARE LECȚIE ÎN PORTAL-ELEVI]")
    print(f"  Sursă producție  : {cale_sursa}")
    print(f"  Destinație portal: {cale_destinatie}")
    print("  Politica profesor: 'iesire/profesor/' -> IGNORAT COMPLET")
    print("-" * 72)

    fisiere_copiate = 0

    # 1. Copiere simulari/simulator.html
    cale_simulator = cale_sursa / "simulari" / "simulator.html"
    if cale_simulator.is_file():
        dest_sim = cale_destinatie / "simulator.html"
        shutil.copy2(cale_simulator, dest_sim)
        fisiere_copiate += 1
        print(f"  [OK] Simulator copiat : {dest_sim.relative_to(PORTAL_ROOT)} ({dest_sim.stat().st_size} octeți)")
    else:
        print(f"  [INFO] Nu a fost găsit fișierul: {cale_simulator}")

    # 2. Copiere iesire/elev/*.pdf (ignorând complet iesire/profesor/)
    director_elev = cale_sursa / "iesire" / "elev"
    if director_elev.is_dir():
        fisiere_pdf = sorted(director_elev.glob("*.pdf"))
        if fisiere_pdf:
            for pdf_file in fisiere_pdf:
                dest_pdf = cale_destinatie / pdf_file.name
                shutil.copy2(pdf_file, dest_pdf)
                fisiere_copiate += 1
                print(f"  [OK] PDF Elev copiat  : {dest_pdf.relative_to(PORTAL_ROOT)} ({dest_pdf.stat().st_size} octeți)")
        else:
            print(f"  [INFO] Niciun fișier PDF găsit în: {director_elev}")
    else:
        print(f"  [INFO] Directorul pentru elevi nu există: {director_elev}")

    print("-" * 72)
    print(f"[FINALIZAT] Total fișiere sincronizate: {fisiere_copiate}")
    print("=" * 72)
    return 0 if fisiere_copiate > 0 else 2


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sincronizează o lecție din 05_materiale direct în clasa-<clasa>/<modul>/<lectie>/ din Portal-Elevi."
    )
    parser.add_argument("cale_lectie", help="Calea completă către folderul lecției din 05_materiale")
    parser.add_argument("--nume-complet", action="store_true", help="Păstrează numele complet al folderului lecției")
    args = parser.parse_args()
    sys.exit(sincronizeaza_lectie(args.cale_lectie, args.nume_complet))


if __name__ == "__main__":
    main()
