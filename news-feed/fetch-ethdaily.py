#!/usr/bin/env python3
"""
Fetch and parse ETH Daily RSS feed (Paragraph).
Outputs top unposted story as JSON to stdout.
"""

import json
import sys
import os
import re
import xml.etree.ElementTree as ET
from urllib.request import urlopen, Request
from urllib.error import URLError

RSS_URL = "https://paragraph.com/api/blogs/rss/%40ethdaily"
POSTED_LOG = os.path.join(os.path.dirname(__file__), "logs/ethdaily-posted.log")

def load_posted():
    if not os.path.exists(POSTED_LOG):
        return set()
    with open(POSTED_LOG) as f:
        return set(line.strip() for line in f if line.strip())

def fetch_feed():
    try:
        req = Request(RSS_URL, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; NewsFeedBot/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
        })
        with urlopen(req, timeout=15) as resp:
            return resp.read()
    except URLError as e:
        print(f"ERROR: Failed to fetch RSS: {e}", file=sys.stderr)
        sys.exit(1)

def strip_html(text):
    return re.sub(r'<[^>]+>', '', text).strip()

def parse_items(xml_data):
    ns = {'content': 'http://purl.org/rss/1.0/modules/content/'}
    root = ET.fromstring(xml_data)
    items = []
    for item in root.findall('.//item'):
        guid = item.findtext('guid', '').strip()
        title = item.findtext('title', '').strip()
        link = item.findtext('link', '').strip()
        pub_date = item.findtext('pubDate', '').strip()
        description = strip_html(item.findtext('description', '').strip())

        # Grab full content if available
        encoded = item.find('{http://purl.org/rss/1.0/modules/content/}encoded')
        full_content = strip_html(encoded.text) if encoded is not None and encoded.text else description

        items.append({
            'guid': guid or link,
            'title': title,
            'link': link,
            'pub_date': pub_date,
            'description': description,
            'full_content': full_content[:2000],  # cap to avoid token bloat
        })
    return items

def main():
    posted = load_posted()
    xml_data = fetch_feed()
    items = parse_items(xml_data)

    fresh = [i for i in items if i['guid'] not in posted]

    if not fresh:
        print(json.dumps({'status': 'no_new_stories'}))
        return

    story = fresh[0]
    story['status'] = 'ok'
    print(json.dumps(story))

if __name__ == '__main__':
    main()
