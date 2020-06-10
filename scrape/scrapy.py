import requests


def run():
    f = open('list.txt')
    fout = open('results.txt', 'w')

    for line in f:
        sub, pic_count = check_sub(line.strip())
        if pic_count > 20:
            fout.write("%s\n" % sub)


def check_sub(sub):
    r = requests.get("http://reddit.com/r/%s.json" % sub)
    pic_count = 0

    if not r.ok:
        print("FAILED TO GET " + sub)
        return sub, 0

    for idx, child in enumerate(r.json['data']['children']):
        url = child['data'].get('url')

        for check in ['jpg', 'gif', 'jgpeg', 'svg', 'png', 'imgur']:
            if check in url:
                pic_count += 1

    print(sub, pic_count)
    return sub, pic_count

if __name__ == "__main__":
    run()
