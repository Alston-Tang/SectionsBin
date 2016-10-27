from mongoengine import *
from app.models import Section


class Page(Document):
    title = StringField(required=True)
    creator = StringField(required=True)
    modified_time = DateTimeField(required=True)
    created_time = DateTimeField(required=True)
    sections = ListField(ReferenceField(Section))