from app import app
from flask import render_template, request, jsonify
from datetime import datetime
from app.dynamic import nav
from app.models import Section
from datetime import datetime


@app.route('/')
def index_fn():
    return "Index"


@app.route('/editor/section')
def edit_fn():
    section_id = request.args.get('sec', None)
    section = Section.objects.get(id=section_id)
    if section:
        template = render_template('editor.html',
                                   section=section.content,
                                   id=section_id,
                                   create=False,
                                   created_time=section.created_time,
                                   modified_time=section.modified_time,
                                   nav_bar=nav.editor_left,
                                   nav_bar_right=nav.editor_right
                                   )
    else:
        template = render_template('editor.html',
                                   create=True,
                                   created_time=datetime.today(),
                                   modified_time=datetime.today(), id=section_id,
                                   nav_bar=nav.editor_left,
                                   nav_bar_right=nav.editor_right
                                   )
    return template


@app.route('/section', methods=['POST', 'GET', 'PUT'])
def section_fn():
    if request.method == "POST":
        title = request.form.get("title", "")
        creator = request.form.get("creator", "")
        modified_time = datetime.utcnow()
        created_time = datetime.utcnow()
        content = request.form.get("content", "")
        preview_img = request.form.get('preview_img', None)
        cur_section = Section(title=title, creator=creator, modified_time=modified_time,
                              created_time=created_time, content=content, preview_img=preview_img)
        cur_section.save(force_insert=True)
        return jsonify({"success": True})
    elif request.method == "GET":
        sections = []
        for section in Section.objects:
            sections.append(section)
        return render_template("section.html", sections=sections)
