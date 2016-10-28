from app import app
from flask import render_template, request, jsonify, abort, redirect, url_for
from datetime import datetime
from app.dynamic import nav
from app.models import *
from datetime import datetime
import json
from app import file


@app.route('/')
def index_fn():
    return "Index"


@app.route('/editor/section')
def edit_fn():
    section_id = request.args.get('sec', None)
    section = None
    if section_id:
        try: section = Section.objects.get(id=section_id)
        except (DoesNotExist, ValidationError):
            pass
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


@app.route('/section', methods=['DELETE', 'POST', 'GET', 'PUT'])
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
        return jsonify({"success": True, "id": str(cur_section.id)})

    elif request.method == "PUT":
        section_id = request.form.get('id', None)
        if not section_id:
            return jsonify({'error': 'Unknown section id'})
        try: section = Section.objects.get(id=section_id)
        except (DoesNotExist, ValidationError):
            return jsonify({'error': 'Unknown section id'})
        title = request.form.get('title', "")
        content = request.form.get('content', "")
        if content == "":
            return jsonify({'error': 'Empty content'})
        if title == "":
            return jsonify({'error': 'Empty title'})
        section.title = title
        section.content = content
        section.create_time = datetime.strptime(request.form.get('create_time', datetime.today().strftime('%Y/%m/%d %H:%M')),
                                        '%Y/%m/%d %H:%M')
        section.modified_time = datetime.today()
        section.preview_img = request.form.get('preview_img', False)
        section.save()
        return jsonify({"success": True, "id": str(section.id)})

    elif request.method == "DELETE":
        section_id = request.form.get('id', None)
        if not section_id:
            return jsonify({'error': 'Unknown section id'})
        try: section = Section.objects.get(id=section_id)
        except (DoesNotExist, ValidationError):
            return jsonify({'error': 'Unknown section id'})
        if len(Page.objects(sections__in=[section])) > 0:
            return jsonify({'error': 'This section is used by at least 1 page'})
        section.delete()
        return jsonify({"success": True})

    elif request.method == "GET":
        sections = []
        for section in Section.objects:
            sections.append(section)
        return render_template("section.html", sections=sections, nav_bar_right=nav.section_right)


@app.route('/editor/page')
def edit_page_fn():
    page_id = request.args.get('page', None)
    page = None
    sections = []
    for section in Section.objects:
        sections.append(section)
    if page_id:
        try: page = Page.objects.get(id=page_id)
        except (DoesNotExist, ValidationError):
            pass
    if page:
        return render_template('page_editor.html', sections=sections,
                               required_page=page,
                               nav_bar_right=nav.editor_right)
    else:
        return render_template('page_editor.html', sections=sections,
                               required_page=None,
                               nav_bar_right=nav.editor_right)


@app.route('/page', methods=['GET', 'POST', 'PUT', 'DELETE'])
def page_fn():
    if request.method == 'GET':
        pages = []
        for page in Page.objects:
            pages.append(page)
        return render_template("page.html",
                               pages=pages,
                               nav_bar_right=nav.page_right)

    if request.method == 'DELETE':
        return jsonify({'error': 'Sorry, you are not allowed to delete page'})

    if request.method == 'POST':
        data = json.loads(request.form.get('data', "[]"))
        title = request.form.get('title', 'untitled')
        creator = request.form.get("creator", "")
        modified_time = datetime.utcnow()
        created_time = datetime.utcnow()
        sections = []
        for section_id in data:
            section = Section.objects.get(id=section_id)
            if section:
                sections.append(section)
        page = Page(title=title, creator=creator, modified_time=modified_time, created_time=created_time)
        for section in sections:
            page.sections.append(section)
        page.save()
        return jsonify({'success': True, "id": str(page.id)})

    if request.method == 'PUT':
        page_id = request.form.get('id', None)
        if not page_id:
            return jsonify({'error': 'Unknown page id'})
        try: page = Page.objects.get(id=page_id)
        except (DoesNotExist, ValidationError):
            return jsonify({'error': 'Unknown page id'})

        data = json.loads(request.form.get('data', "[]"))
        if not data:
            return jsonify({'error': 'Empty page is not allowed'})
        sections = []
        for section_id in data:
            section = Section.objects.get(id=section_id)
            if section:
                sections.append(section)
        title = request.form.get('title', None)
        creator = request.form.get("creator", None)
        if title:
            page.title = title
        if creator:
            page.creator = creator
        page.modified_time = datetime.utcnow()
        page.sections.clear()
        for section in sections:
            page.sections.append(section)
        page.save()
        return jsonify({'success': True, "id": str(page.id)})


@app.route("/page/<page_title>")
def page_by_title_fn(page_title):
    page = Page.objects(title=page_title)
    if len(page) > 1 or len(page) <= 0:
        abort(404)
    page = page.first()
    return render_template("basic_page.html", title=page.title, page=page)


@app.route("/file")
def file_fn():
    return app.send_static_file('html/file_upload.html')


# file upload ajax handle get & post
@app.route('/ajax/file_upload', methods=['GET', 'POST'])
def main_upload():
    if request.method == 'GET':
        type = request.args.get('type')
        return file.upload_test.get()
    elif request.method == 'POST':
        upload_file = request.files.get('files[]')
        return file.upload_test.post(upload_file)


@app.route('/ajax/upload/pic', methods=['GET'])
def public_pic():
    return file.upload_test.get_pic()


# file upload ajax handle delete
@app.route('/ajax/file_upload/<file_name>', methods=['DELETE'])
def main_delete(file_name):
    if not request.method == 'DELETE':
        pass
    return file.upload_test.delete(file_name)


@app.errorhandler(404)
def page_not_found(e):
    return render_template('error/404.html'), 404


