// Author: Nathan Van Gheem
// Contact: nathan@vangheem.us
// Version: 1.0
//
// Description:
//
// License:
//
// Copyright (C) 2010 Plone Foundation
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program; if not, write to the Free Software Foundation, Inc., 51
// Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
//


define([
  'jquery',
  'underscore',
  'backbone',
  'js/ui/views/base',
  'mockup-patterns-tree',
  'mockup-patterns-texteditor',
  'text!js/patterns/filemanager/templates/app.xml',
  'js/ui/views/toolbar',
  'js/ui/views/button',
  'js/ui/views/buttongroup',
  'js/patterns/filemanager/views/addnew',
  'js/patterns/filemanager/views/newfolder',
  'js/patterns/filemanager/views/delete',
  'js/patterns/filemanager/views/customize',
  'js/patterns/filemanager/views/rename',
  'js/patterns/filemanager/views/upload',
  'mockup-utils',
], function($, _, Backbone, BaseView, Tree, TextEditor, AppTemplate, Toolbar,
            ButtonView, ButtonGroup, AddNewView, NewFolderView, DeleteView,
            CustomizeView, RenameView, UploadView, utils) {
  'use strict';

  var AppView = BaseView.extend({
    tagName: 'div',
    className: 'filemanager',
    template: AppTemplate,
    tabItemTemplate: _.template(
      '<li class="active" data-path="<%= path %>">' +
        '<a href="#" class="select"><%= path %></a>' +
        '<a href="#" class="remove">' +
          '<span class="glyphicon glyphicon-remove-circle"></span>' +
        '</a>' +
      '</li>'),
    saveBtn: null,
    fileData: {},  /* mapping of files to data that it describes */
    initialize: function(options) {
      var self = this;
      BaseView.prototype.initialize.apply(self, [options]);

      self.fileData = {};
      self.saveBtn = new ButtonView({
        id: 'save',
        title: 'Save',
        context: 'success'
      });

      var newFolderView = new NewFolderView({
        triggerView: new ButtonView({
          id: 'newfolder',
          title: 'New Folder',
          tooltip: 'Add new folder',
          context: 'default'
        }),
        app: self
      });
      var addNewView = new AddNewView({
        triggerView: new ButtonView({
          id: 'addnew',
          title: 'New File',
          tooltip: 'Add new file',
          context: 'default'
        })
      });
      var customizeView = new CustomizeView({
        triggerView: new ButtonView({
          id: 'customize',
          title: 'Add New Override',
          tooltip: 'find resource to customize',
          context: 'default'
        })
      });
      var renameView = new RenameView({
        triggerView: new ButtonView({
          id: 'rename',
          title: 'Rename',
          tooltip: 'Rename resource',
          context: 'default'
        })
      });
      var deleteView = new DeleteView({
        triggerView: new ButtonView({
          id: 'delete',
          title: 'Delete',
          tooltip: 'Delete resource',
          context: 'danger'
        })
      });

      self.views = [
        newFolderView,
        addNewView,
        customizeView,
        renameView,
        deleteView
      ];
      var mainButtons = [
        newFolderView.triggerView,
        addNewView.triggerView,
        customizeView.triggerView
      ];

      if (self.options.uploadUrl){
        var uploadView = new UploadView({
          triggerView: new ButtonView({
            id: 'upload',
            title: 'Upload',
            tooltip: 'Upload new file',
            context: 'default'
          }),
          app: self
        });
        self.views.push(uploadView);
        mainButtons.splice(2, 0, uploadView.triggerView);
      }

      self.toolbar = new Toolbar({
        items: [
          new ButtonGroup({
            items: mainButtons,
            id: 'main',
            app: self
          }),
          new ButtonGroup({
            items: [
              renameView.triggerView,
              deleteView.triggerView
            ],
            id: 'secondary',
            app: self
          }),
          self.saveBtn
        ]
      });

      self.saveBtn.on('button:click', function(e) {
        self.doAction('saveFile', {
          type: 'POST',
          data: {
            path: self.$tree.tree('getSelectedNode').label
          },
          success: function(data) {
            /* XXX unhighlight save button */
          }
        });
      });
    },
    render: function() {
      var self = this;
      self.applyTemplate();
      self.$('#toolbar').append(self.toolbar.render().el);
      _.each(self.views, function(view) {
        self.$('#toolbar').append(view.render().el);
      });
      self.$tree = self.$('.tree');
      self.$nav = self.$('nav');
      self.$tabs = $('ul.nav', self.$nav);
      self.treeConfig.onLoad = function(tree) {
        // on loading initial data, activate first node if available
        var node = self.$tree.tree('getNodeById', 1);
        if (node){
          self.$tree.tree('selectNode', node);
          self.openFile({node: node});
        }
      };
      self.tree = new Tree(self.$tree, self.treeConfig);
      self.$tree.bind('tree.click', function(e) {
        self.openFile(e);
      });
      self.$editor = self.$('.editor');
      return self;
    },
    openFile: function(event) {
      var self = this;
      var doc = event.node.name;
      if (event.node.folder){
        return true;
      }

      self.doAction('getFile', {
        data: { path: doc },
        dataType: 'json',
        success: function(data) {
          self.fileData[doc] = data;
          $('li', self.$tabs).removeClass('active');
          var $existing = $('[data-path="' + doc + '"]');
          if ($existing.length === 0){
            var $item = $(self.tabItemTemplate({path: doc}));
            self.$tabs.append($item);
            $('.remove', $item).click(function(e){
              e.preventDefault();
              $(this).parent().remove();
            });
            $('.select', $item).click(function(e){
              e.preventDefault();
              $('li', self.$tabs).removeClass('active');
              var $li = $(this).parent();
              $li.addClass('active');
              self.openEditor($li.attr('data-path'));
            });
          }else{
            $existing.addClass('active');
          }
          self.openEditor(doc);
        }
      });
    },
    doAction: function(action, options) {
      var self = this;
      if (!options){
        options = {};
      }
      $.ajax({
        url: self.options.actionUrl,
        type: options.type || 'GET',
        data: $.extend({}, {
          _authenticator: utils.getAuthenticator(),
          action: action
        }, options.data || {}),
        success: options.success,
        failure: options.failure || function() {}
      });
    },
    openEditor: function(path) {
      var self = this;
      if (self.ace !== undefined){
        self.ace.editor.destroy();
      }
      self.ace = new TextEditor(self.$editor, {
        width: self.$editor.width()
      });
      self.ace.setSyntax(path);
      self.ace.setText(self.fileData[path].data);
    }
  });

  return AppView;
});
