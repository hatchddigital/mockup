// Author: Nathan Van Gheem
// Contact: nathan@vangheem.us
// Version: 1.0
//
// Description:
//    TinyMCE pattern (for now its depening on Plone's integration)
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
  'mockup-patterns-base',
  'mockup-patterns-relateditems',
  'mockup-patterns-modal',
  'tinymce',
  'mockup-patterns-dropzone',
  'dropzone',
  'text!js/patterns/tinymce/templates/result.xml',
  'text!js/patterns/tinymce/templates/selection.xml',
  'mockup-utils',
  'js/patterns/tinymce/links',
  'js/patterns/tinymce/upload'
], function($, _, Base, RelatedItems, Modal, tinymce, DropZone, dropzone,
            ResultTemplate, SelectionTemplate, utils, LinkModal, UploadModal) {
  "use strict";

  var TinyMCE = Base.extend({
    name: 'tinymce',
    defaults: {
      relatedItems: {
        // UID attribute is required here since we're working with related items
        attributes: ['UID', 'Title', 'Description', 'getURL', 'Type', 'path', 'ModificationDate'],
        batchSize: 20,
        basePath: '/',
        vocabularyUrl: null,
        width: 500,
        maximumSelectionSize: 1,
        placeholder: 'Search for item on site...'
      },
      text: {
        insertBtn: 'Insert', // so this can be configurable for different languages
        cancelBtn: 'Cancel',
        insertHeading: 'Insert link',
        title: 'Title',
        internal: 'Internal',
        external: 'External',
        email: 'Email',
        anchor: 'Anchor',
        subject: 'Subject',
        image: 'Image',
        imageAlign: 'Align',
        scale: 'Size',
        alt: 'Alternative Text',
        externalImage: 'External Image URI'
      },
      // URL generation options
      prependToUrl: '',
      appendToUrl: '',
      linkAttribute: 'path', // attribute to get link value from data
      prependToScalePart: '/imagescale/', // some value here is required to be able to parse scales back
      appendToScalePart: '',
      scales: 'Half Size (400x267):halfsize,Full Size (912x547):fullsize',
      targetList: [
        {text: 'Open in this window / frame', value: ''},
        {text: 'Open in new window', value: '_blank'},
        {text: 'Open in parent window / frame', value: '_parent'},
        {text: 'Open in top frame (replaces all frames)', value: '_top'}
      ],
      imageTypes: 'Image',
      folderTypes: 'Folder,Plone Site',
      linkableTypes: 'Document,Event,File,Folder,Image,News Item,Topic',
      tiny: {
        plugins: [
          "advlist autolink lists charmap print preview anchor ploneupload",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table contextmenu paste plonelink ploneimage"
        ],
        menubar: "edit table format tools view insert",
        toolbar: "undo redo | styleselect | bold italic | " +
                 "alignleft aligncenter alignright alignjustify | " +
                 "bullist numlist outdent indent | " +
                 "unlink plonelink ploneimage | ploneupload",
        autoresize_max_height: 1500,
        height: 150
      },
      rel_upload_path: null,
      folder_url: null
    },
    uploadFileClicked: function(){
      var self = this;
      if(self.uploadModal === null){
        var $el = $('<div/>').insertAfter(self.$el);
        self.uploadModal = new UploadModal($el,
          $.extend(true, {}, self.options, {
            tinypattern: self,
            relatedItems: {
              baseCriteria: [{
                i: 'Type',
                o: 'plone.app.querystring.operation.list.contains',
                v: self.options.folderTypes.split(',')
              }],
              placeholder: 'Select a folder to upload to...'
            }
          })
        );
        self.uploadModal.show();
      } else {
        self.uploadModal.reinitialize();
        self.uploadModal.show();
      }
    },
    addLinkClicked: function(){
      var self = this;
      if(self.linkModal === null){
        var $el = $('<div/>').insertAfter(self.$el);
        self.linkModal = new LinkModal($el,
          $.extend(true, {}, self.options, {
            tinypattern: self,
            linkTypes: [
              'internal',
              'external',
              'email',
              'anchor'
            ]
          })
        );
        self.linkModal.show();
      } else {
        self.linkModal.reinitialize();
        self.linkModal.show();
      }
    },
    addImageClicked: function(){
      var self = this;
      if(self.imageModal === null){
        var options = $.extend(true, {}, self.options, {
          tinypattern: self,
          linkTypes: ['image', 'externalImage'],
          initialLinkType: 'image',
          text: {
            insertHeading: 'Insert Image'
          },
          relatedItems: {
            baseCriteria: [{
              i: 'Type',
              o: 'plone.app.querystring.operation.list.contains',
              v: self.options.imageTypes.split(',').concat(self.options.folderTypes.split(','))
            }],
            selectableTypes: self.options.imageTypes.split(','),
            resultTemplate: ResultTemplate,
            selectionTemplate: SelectionTemplate
          }
        });
        var $el = $('<div/>').insertAfter(self.$el);
        self.imageModal = new LinkModal($el, options);
        self.imageModal.show();
      } else {
        self.imageModal.reinitialize();
        self.imageModal.show();
      }
    },
    generateUrl: function(data){
      var self = this;
      var part = data[self.options.linkAttribute];
      return self.options.prependToUrl + part + self.options.appendToUrl;
    },
    generateImageUrl: function(data, scale){
      var self = this;
      var url = self.generateUrl(data);
      return url + self.options.prependToScalePart + scale + self.options.appendToScalePart;
    },
    stripGeneratedUrl: function(url){
      // to get original attribute back
      var self = this;
      url = url.split(self.options.prependToScalePart, 2)[0];
      if(self.options.prependToUrl){
        var parts = url.split(self.options.prependToUrl, 2);
        if(parts.length === 2){
          url = parts[1];
        }
      }
      if(self.options.appendToUrl){
        url = url.split(self.options.appendToUrl)[0];
      }
      return url;
    },
    getScaleFromUrl: function(url){
      var self = this;
      var split = url.split(self.options.prependToScalePart);
      var baseUrl = split[0];
      if(split.length !== 2){
        // not valid scale, screw it
        return null;
      }
      if(self.options.appendToScalePart){
        url = split[1].split(self.options.appendToScalePart)[0];
      }else{
        url = split[1];
      }
      if(url.indexOf('/image_') !== -1){
        url = url.split('/image_')[1];
      }
      return url;
    },
    fileUploaded: function(data){
      var self = this;
      if(data === null){
        return; // bail, something is wrong here...
      }
      var filename = data.filename;
      var ext = filename.split('.');
      ext = ext[ext.length-1].toLowerCase();
      var attr;

      if(['png', 'jpg', 'gif', 'jpeg'].indexOf(ext) !== -1){
        /* handle images different than others */
        attr = {
          src: self.generateImageUrl(data, 'thumb'),
          class: 'image-inline'
        };
        attr.id = '__mcenew';
        self.tiny.insertContent(self.tiny.dom.createHTML('img', attr));
        var imgElm = self.tiny.dom.get('__mcenew');
        self.tiny.dom.setAttrib(imgElm, 'id', null);
      }else{
        attr = {
          id: '__mcenew'
        };
        self.tiny.insertContent(self.tiny.dom.createHTML('a', attr));
        var aElm = self.tiny.dom.get('__mcenew');
        self.tiny.dom.setAttrib(aElm, 'id', null);
        self.tiny.dom.setAttrib(aElm, 'href', self.generateUrl(data));
        self.tiny.dom.setHTML(aElm, filename);
      }
    },
    fileUploadError: function(){
      /* XXX need to be able to handle errors better? */
      alert('There was an error attempting to upload file. ' +
            'It is possible the file you are uploading is not allowed ' +
            'in the folder you are trying to add it to.');
    },
    init: function() {
      var self = this;
      self.linkModal = self.imageModal = self.uploadModal = null;
      // tiny needs an id in order to initialize. Creat it if not set.
      var id = utils.setId(self.$el);
      var tinyOptions = self.options.tiny;
      tinyOptions.selector = '#' + id;
      tinyOptions.addLinkClicked = function(){
        self.addLinkClicked.apply(self, []);
      };
      tinyOptions.addImageClicked = function(){
        self.addImageClicked.apply(self, []);
      };
      // XXX: disabled skin means it wont load css files which we already
      // include in widgets.min.css
      tinyOptions.skin = false;

      self.options.relatedItems.generateImageUrl = function(data, scale){
        // this is so, in our result and selection template, we can
        // access getting actual urls from related items
        return self.generateImageUrl.apply(self, [data, scale]);
      };

      if(!self.options.base_url){
        self.options.base_url = window.location.href;
      }
      if(self.options.rel_upload_path){
        self.options.uploadUrl = self.options.folder_url + '/' + self.options.rel_upload_path;
      } else {
        self.options.uploadUrl = null;
      }

      if(self.options.uploadUrl){
        /*
         * disable until it works better
         * can still upload via link and file overlays

        self.dropzone = new DropZone(self.$el, {
          className: 'tinymce-dropzone',
          clickable: false,
          url: self.options.uploadUrl,
          wrap: true,
          autoCleanResults: true,
          success: function(e, data){
            self.fileUploaded($.parseJSON(data));
          },
          error: function(){
            self.fileUploadError();
          }
        });
        */

        tinyOptions.uploadFileClicked = function(){
          self.uploadFileClicked.apply(self, []);
        };
      } else {
        // disable upload button
        tinyOptions.plugins[0] = tinyOptions.plugins[0].replace('ploneupload', '');
        tinyOptions.toolbar = tinyOptions.toolbar.replace('ploneupload', '');
      }

      tinymce.init(tinyOptions);

      /* fixes chrome at least,
       * still not working quite right in firefox
      if(self.options.uploadUrl){
        var events = ["drop", "dragstart", "dragend", "dragenter", "dragover",
                      "dragleave"];
        var iframe = self.$el.prev().find('.mce-edit-area iframe');
        var win = $(window.frames[iframe.attr('id')]);
        var body = iframe.contents().find('body');
        $.each(events, function(index, ev){
          win.on(ev, function(e){
            self.dropzone.dropzone.emit(ev);
            console.log(ev);
          });
          body.on(ev, function(e){
            self.dropzone.dropzone.emit(ev);
            console.log(ev);
          });
        });
      }*/
      self.tiny = tinymce.get(id);

      /* tiny really should be doing this by default
       * but this fixes overlays not saving data */
      var $form = self.$el.parents('form');
      $form.on('submit', function(){
        self.tiny.save();
      });
    }
  });

  return TinyMCE;

});
