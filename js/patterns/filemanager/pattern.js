/* Filemanager pattern.
 *
 * Options:
 *    aceConfig(object): ace configuration ({})
 *    actionUrl(string): base url to get/put data. Action is passed is an a parameters, ?action=(dataTree, newFile, deleteFile, getFile, saveFile)
 *    uploadUrl(string): url to upload files to
 *    resourceSearchUrl(string): url to search for resources to customize
 *    translations(object): mapping of translation strings
 *
 * Documentation:
 *
 *
 *   {{ example-1 }}
 *
 *   Example with upload
 *
 *   {{ example-2 }}
 *
 * Example: example-1
 *    <div class="pat-filemanager"
 *         data-pat-filemanager="actionUrl:/filemanager-actions;
 *                               resourceSearchUrl:/search-resources;">
 *    </div>
 *
 * Example: example-2
 *    <div class="pat-filemanager"
 *         data-pat-filemanager="actionUrl:/filemanager-actions;
 *                               uploadUrl:/upload;
 *                               resourceSearchUrl:/search-resources;">
 *    </div>
 *
 * License:
 *    Copyright (C) 2010 Plone Foundation
 *
 *    This program is free software; you can redistribute it and/or modify it
 *    under the terms of the GNU General Public License as published by the
 *    Free Software Foundation; either version 2 of the License.
 *
 *    This program is distributed in the hope that it will be useful, but
 *    WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
 *    Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License along
 *    with this program; if not, write to the Free Software Foundation, Inc.,
 *    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


define([
  'jquery',
  'mockup-patterns-base',
  'js/patterns/filemanager/views/app',
  'text!js/ui/templates/popover.xml'
], function($, Base, AppView) {
  'use strict';

  var FileManager = Base.extend({
    name: 'filemanager',
    defaults: {
      aceConfig: {},
      actionUrl: null,
      uploadUrl: null,
      resourceSearchUrl: null,
      translations: {
        add_new_file: 'New file',
        add_new_file_tooltip: 'Add new file to current folder',
        add_override: 'Add new override',
        add_override_tooltip: 'Find resource in plone to override',
        delete: 'Delete',
        delete_tooltip: 'Delete currently selected file',
        new_folder: 'New folder',
        new_folder_tooltip: 'Add new folder to current directory',
        rename: 'Rename',
        rename_tooltip: 'Rename currently selected resource',
        upload: 'Upload',
        upload_tooltip: 'Upload file to current directory',
        filename: 'Filename',
        enter_filename: 'Enter filename',
        add: 'Add',
        search: 'Search',
        search_resources: 'Search resources',
        customize: 'Customize',
        yes_delete: 'Yes, delete',
        delete_question: 'Are you sure you want to delete this resource?',
        folder_name: 'Folder name',
        enter_folder_name: 'Enter folder name',
        save: 'Save'
      }
    },
    treeConfig: {
      autoOpen: true
    },
    init: function() {
      var self = this;
      if (self.options.actionUrl !== null) {
        self.options.treeConfig = $.extend(true, {}, self.treeConfig, {
          dataUrl: self.options.actionUrl + '?action=dataTree'
        });
        self.appView = new AppView(self.options);
        self.$el.append(self.appView.render().el);
      } else {
        self.$el.html('Must specify actionUrl setting for pattern');
      }
    }
  });

  return FileManager;

});
