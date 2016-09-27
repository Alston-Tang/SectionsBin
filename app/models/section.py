from mongoengine import *


class Section(Document):
    title = StringField(required=True)
    creator = StringField(required=True)
    modified_time = DateTimeField(required=True)
    created_time = DateTimeField(required=True)
    content = StringField(required=True)
    preview_img = StringField()

