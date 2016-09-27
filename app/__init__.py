from flask import Flask

app = Flask(__name__)

from app import controlers
from app.plugins import *
