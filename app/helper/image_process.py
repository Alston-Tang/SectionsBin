__author__ = 'tang'

from app import root_path
from PIL import Image

thumbnail_width = 200
thumbnail_height = -1

def thumbnail(input, **opt):
    if not 'output' in opt:
        output = root_path
    else:
        output = opt['output']

    img = Image.open(input)

    width = thumbnail_width
    if thumbnail_height < 0:
        height = int(thumbnail_width*(float(img.size[1])/float(img.size[0])))
    else:
        height = thumbnail_height

    img_out = img.resize((width, height), Image.BILINEAR)
    img_out.save(output)
