#!/usr/bin/env python3
"""Humanize markdown files: fix curly quotes, em dashes, AI vocabulary.
Preserves markdown structure (headers, code blocks, bold, tables)."""

import re, sys, os

# AI vocabulary replacements (context-aware)
VOCAB = [
    (r'\bdelve\b', 'dig into'),
    (r'\btapestry\b', 'mix'),
    (r'\blandscape\b', 'space'),
    (r'\bpivotal\b', 'key'),
    (r'\bunderscore\b', 'highlight'),
    (r'\bfoster\b', 'build'),
    (r'\bleverage\b', 'use'),
    (r'\butilize\b', 'use'),
    (r'\butilization\b', 'use'),
    (r'\boptimize\b', 'improve'),
    (r'\boptimized\b', 'tuned'),
    (r'\bimplement\b', 'set up'),
    (r'\bimplementation\b', 'setup'),
    (r'\bimplementing\b', 'setting up'),
    (r'\bseamlessly\b', 'smoothly'),
    (r'\bseamless\b', 'smooth'),
    (r'\brobust\b', 'solid'),
    (r'\bcomprehensive\b', 'full'),
    (r'\bfacilitate\b', 'enable'),
    (r'\bensure\b', 'make sure'),
    (r'\benhance\b', 'boost'),
    (r'\benhanced\b', 'better'),
    (r'\benhancing\b', 'boosting'),
    (r'\bultimately\b', 'in the end'),
    (r'\bfurthermore\b', 'also'),
    (r'\bmoreover\b', 'also'),
    (r'\badditionally\b', 'also'),
    (r'\bnevertheless\b', 'still'),
    (r'\bnonetheless\b', 'still'),
    (r'\bconsequently\b', 'so'),
    (r'\bsubsequently\b', 'then'),
    (r'\bsignificantly\b', 'a lot'),
    (r'\bfundamentally\b', 'at its core'),
    (r'\bintrinsically\b', 'by nature'),
    (r'\bparadigm\b', 'model'),
    (r'\becosystem\b', 'network'),
    (r'\bsynergy\b', 'overlap'),
    (r'\bholistic\b', 'complete'),
    (r'\bstakeholders\b', 'people involved'),
    (r'\bactionable\b', 'practical'),
    (r'\bscalable\b', 'growable'),
    (r'\bstreamline\b', 'simplify'),
    (r'\bstreamlined\b', 'simplified'),
    (r'\bempower\b', 'let'),
    (r'\bempowers\b', 'lets'),
    (r'\bempowering\b', 'letting'),
    (r'\binnovative\b', 'new'),
    (r'\btransformative\b', 'game-changing'),
    (r'\bgroundbreaking\b', 'new'),
    (r'\bcutting-edge\b', 'modern'),
    (r'\bstate-of-the-art\b', 'current'),
    (r'\bnuanced\b', 'detailed'),
    (r'\bmultifaceted\b', 'complex'),
    (r'\bgranular\b', 'detailed'),
    (r'\baforementioned\b', 'earlier'),
    (r'\bIt\'s worth noting that\b', ''),
    (r'\bIt is worth noting that\b', ''),
    (r'\bserves as a testament\b', 'proves'),
    (r'\bplays a crucial role\b', 'matters'),
    (r'\bin today\'s\b', 'in the current'),
    (r'\bjourney\b', 'process'),
]

def humanize_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    original = content
    
    # 1. Fix curly quotes → straight quotes (biggest AI signal)
    content = content.replace('\u2018', "'")  # '
    content = content.replace('\u2019', "'")  # '
    content = content.replace('\u201c', '"')   # "
    content = content.replace('\u201d', '"')   # "
    
    # 2. Fix em dashes → comma, period, or line break
    # In markdown, preserve structure but replace em dashes
    content = content.replace('\u2014', ' -')   # — → space-hyphen
    content = content.replace('\u2013', '-')     # – → hyphen
    
    # 3. AI vocabulary (only in non-code-block lines)
    lines = content.split('\n')
    in_code = False
    result = []
    for line in lines:
        if line.strip().startswith('```'):
            in_code = not in_code
            result.append(line)
            continue
        if in_code:
            result.append(line)
            continue
        for pattern, replacement in VOCAB:
            line = re.sub(pattern, replacement, line, flags=re.IGNORECASE)
        result.append(line)
    content = '\n'.join(result)
    
    # 4. Remove "Here's" pattern starts (AI tell)
    content = re.sub(r"Here's (?:the |a |an |what |how |why )", lambda m: m.group().replace("Here's ", ""), content)
    
    changes = []
    if '\u2018' in original or '\u2019' in original or '\u201c' in original or '\u201d' in original:
        curly_count = original.count('\u2018') + original.count('\u2019') + original.count('\u201c') + original.count('\u201d')
        changes.append(f'Fixed {curly_count} curly quotes')
    if '\u2014' in original or '\u2013' in original:
        changes.append('Fixed em/en dashes')
    
    vocab_changes = 0
    for pattern, replacement in VOCAB:
        vocab_changes += len(re.findall(pattern, original, re.IGNORECASE))
    if vocab_changes:
        changes.append(f'Replaced {vocab_changes} AI vocabulary words')
    
    with open(path, 'w') as f:
        f.write(content)
    
    return changes

if __name__ == '__main__':
    for path in sys.argv[1:]:
        changes = humanize_file(path)
        name = os.path.basename(path)
        print(f'{name}: {", ".join(changes) if changes else "no changes"}')
