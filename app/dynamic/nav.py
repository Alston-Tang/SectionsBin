from app.models import Page

editor_left = {"Add": {"_type": "drop_down",
                       "data": {
                           "Text": {"class": "editor-nav add-text", "add": "text"},
                           "Image": {"class": "editor-nav add-image", "add": "img"},
                           "Picture Wall": {"class": "editor-nav add-picture-wall", "add": "picture-wall"},
                           "Carousel": {"class": "editor-nav add-carousel", "add": "bootstrapCarousel"},
                           "Jumbotron": {"class": "editor-nav add-jumbotron", "add": "bootstrapJumbotron"}

                       }},
               "Setting": {"_type": "drop_down",
                           "data": {
                               "Section Setting": {"class": "setting-nav setting-section"},
                               "Section Information": {"class": "setting-nav setting-information"}}}
               }

editor_right = {"Save": {"_type": "button", "data": {"id": "btn-save", "style": "cursor: pointer"}}}
page_right = {"Add": {"_type": "button", "data": {"href": "editor/page"}}}
section_right = {"Add": {"_type": "button", "data": {"href": "editor/section"}}}

nav = {"editor_left": editor_left, "editor_right": editor_right}

def gen_page_left():
    rv = {}
    for page in Page.objects:
        rv[page.title] = {"_type": "button", "data": {"href": '/page/%s' % page.title}}
    return rv
