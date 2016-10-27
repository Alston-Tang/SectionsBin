from flask import Flask
from os import path

root_path = path.dirname(path.abspath(__file__))
app = Flask(__name__)

from app import controlers
from app.plugins import *
