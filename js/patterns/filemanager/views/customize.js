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
  'js/ui/views/popover'
], function($, _, Backbone, PopoverView) {
  'use strict';

  var CustomizeView = PopoverView.extend({
    className: 'popover customize',
    title: _.template('Add customization'),
    content: _.template(
      '<div class="form-group">' +
        '<label for="search-field">Search</label>' +
        '<input type="text" class="form-control" ' +
                'id="search-field" placeholder="Search resources...">' +
      '</div>' +
      '<button class="btn btn-block btn-danger">Customize</button>'
    ),
    events: {
      'click button': 'customizeButtonClicked'
    },
    initialize: function(options) {
      this.app = options.app;
      PopoverView.prototype.initialize.apply(this, [options]);
    },
    customizeButtonClicked: function(e) {
      var self = this;
      var $input = self.$('input');
      var resource = $input.val();
      if (resource){
        self.app.doAction('customize', {
          type: 'POST',
          data: {
            resource: resource
          },
          success: function(data) {
            self.hide();
            self.app.$tree.tree('reload');
          }
        });
      } else {
        self.$('.form-group').addClass('has-error');
      }
      // XXX show loading
    }
  });

  return CustomizeView;
});
