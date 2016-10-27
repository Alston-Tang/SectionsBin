__author__ = 'Tang'
from os import path
import magic, os
import json
from app.helper import image_process

from app import root_path

upload_directory = '/static/upload'
upload_full_dir = (root_path + upload_directory).replace('\\', '/')
delete_directory = '/ajax/file_upload/'


def get_file_inf(name, directory, full_dir):
    inf = {}
    full_path = full_dir + '/' + name

    inf['name'] = name
    inf['type'] = magic.from_file(full_path, mime=True)
    inf['size'] = os.stat(full_path).st_size
    inf['url'] = (directory + '/' + name).replace('/', '\\/')
    inf['deleteUrl'] = delete_directory + inf['name']
    inf['deleteType'] = 'DELETE'
    return inf


class GetHandler:
    def __init__(self, **opt):
        if 'select_dir' in opt:
            self.directory = upload_directory + '/' + opt['select_dir']
            self.full_dir = upload_full_dir + '/' + opt['select_dir']
        else:
            self.directory = upload_directory
            self.full_dir = upload_full_dir

        if 'restrict' in opt:
            if 'allow' in opt['restrict']:
                self.restrict = 'allow'
                self.restrict_list = opt['restrict']['allow']
            elif 'deny' in opt['restrict']:
                self.restrict = 'deny'
                self.restrict_list = opt['restrict']['deny']
        else:
            self.restrict = False

        # Check End
        self.files = []
        for file in os.listdir(self.full_dir):
            # Files only
            if not os.path.isfile(self.full_dir + '/' + file):
                ##print file+' not a file'
                continue
            inf = get_file_inf(file, self.directory, self.full_dir)
            self.handle_thumbnail(inf, file, self.directory)
            self.files.append(inf)

    def error_json(self, file, error_inf):
        files = [{'name': file, 'error': error_inf}]
        return json.dumps({'files': files})

    def validate_restrict(self, file_storage):
        if not self.restrict:
            return True
        find = False
        for type in self.restrict_list:
            if file_storage.mimetype.find(type) >= 0:
                find = True
                break

        return (find and self.restrict == 'allow') or (not find and self.restrict == 'deny')

    def handle_thumbnail(self, inf, name, directory):
        """
        If file is a image and not exists a thumbnail, create a thumbnail at folder ./thumbnail
        :param inf: information of the file created by function "get_file_inf"
        :return: null
        """
        if inf['type'].find('image') >= 0:
            # Create thumbnail if no exists one
            if not os.path.exists(self.full_dir + '/thumbnail'):
                os.makedirs(self.full_dir + '/' + 'thumbnail')
            if not os.path.isfile(self.full_dir + '/thumbnail/' + inf['name']):
                image_process.thumbnail(self.full_dir + '/' + inf['name'],
                                               output=self.full_dir + '/thumbnail/' + inf['name'])
            inf['thumbnailUrl'] = (directory + '/thumbnail/' + name).replace('/', '\\/')

    def delete_thumbnail(self, file):
        if os.path.isfile(self.full_dir + '/thumbnail/' + file):
            os.remove(self.full_dir + '/thumbnail/' + file)

    def delete_from_files(self, file):
        """
        Delete record from files inside this class
        :param file: the file name to be deleted
        :return: if success return true
                 if not find any record return false
        """
        for inf in self.files:
            if inf['name'] == file:
                self.files.remove(inf)
                return True

        return False

    def get(self):
        return json.dumps({'files': self.files}).replace('\\\\', '\\')

    def get_pic(self):
        files_list = []
        for a_file in self.files:
            if a_file['type'].find('image') >= 0:
                files_list.append(a_file)
        return json.dumps({'files': files_list}).replace('\\\\', '\\')

    def post(self, file_storage):
        file = file_storage.filename
        if not self.validate_restrict(file_storage):
            return self.error_json(file, "Not valid type")
        if os.path.isfile(self.full_dir + '/' + file):
            return self.error_json(file, "File name already exists")
        else:
            file_storage.save(self.full_dir + '/' + file)
            inf = get_file_inf(file, self.directory, self.full_dir)
            self.handle_thumbnail(inf, file_storage.filename, self.directory)
            self.files.append(inf)
            return json.dumps({'files': [inf]}).replace('\\\\', '\\')

    def delete(self, file):
        """
        Handle delete request, delete file on file system and return jquery file upload json
        :param file: the file name to be deleted
        :return: if success return true json according to jquery file upload's requirement
                 if failed return error json according to jquery file upload's requirement
        """
        if os.path.isfile(self.full_dir + '/' + file):
            os.remove(self.full_dir + '/' + file)
            self.delete_thumbnail(file)
            if not self.delete_from_files(file):
                print ("Warn: Files on disk and files records are not consistent")
            return json.dumps({"files": [{file: 'true'}]})
        else:
            print ("Warn: Files on disk and files records are not consistent")
            self.delete_thumbnail(file)
            self.delete_from_files(file)
            return self.error_json(file, 'File not exists')


upload_test = GetHandler()