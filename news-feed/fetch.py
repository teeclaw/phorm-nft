#!/usr/bin/env python3
"""
Fetch and parse The Block RSS feed.
Outputs top unposted story as JSON to stdout.
"""

import json
import sys
import os
import xml.etree.ElementTree as ET
from urllib.request import urlopen
from urllib.error import URLError
from datetime import datetime

RSS_URL = "https://www.theblock.co/rss.xml"
POSTED_LOG = os.path.join(os.path.dirname(__file__), "logs/posted.log")
TOP_N = 5  # candidates to consider

def load_posted():
    if not os.path.exists(POSTED_LOG):
        return set()
    with open(POSTED_LOG) as f:
        return set(line.strip() for line in f if line.strip())

def fetch_feed():
    from urllib.request import Request
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

def parse_items(xml_data):
    ns = {
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'dc': 'http://purl.org/dc/elements/1.1/',
        'media': 'http://search.yahoo.com/mrss/',
    }
    root = ET.fromstring(xml_data)
    items = []
    for item in root.findall('.//item'):
        guid = item.findtext('guid', '').strip()
        title = item.findtext('title', '').strip()
        link = item.findtext('link', '').strip()
        pub_date = item.findtext('pubDate', '').strip()
        description = item.findtext('description', '').strip()
        # Strip HTML from description
        import re
        description = re.sub(r'<[^>]+>', '', description).strip()

        categories = [c.text for c in item.findall('category') if c.text]

        items.append({
            'guid': guid or link,
            'title': title,
            'link': link,
            'pub_date': pub_date,
            'description': description,
            'categories': categories,
        })
    return items

def main():
    posted = load_posted()
    xml_data = fetch_feed()
    items = parse_items(xml_data)

    # Filter out already-posted
    fresh = [i for i in items if i['guid'] not in posted]

    if not fresh:
        print(json.dumps({'status': 'no_new_stories'}))
        return

    # Take the latest unposted story
    story = fresh[0]
    story['status'] = 'ok'
    print(json.dumps(story))

if __name__ == '__main__':
    main()
