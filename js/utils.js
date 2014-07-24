// utils.
//
// Author: Nathan Van Gheem
// Contact: nathan@vangheem.us
// Version: 1.0
// Depends: jquery.js
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
  'jquery'
], function($) {
  "use strict";

  var utils = {

    parseBodyTag: function(txt, strip_scripts){
        if (strip_scripts) {
            return $((/<body[^>]*>((.|[\n\r])*)<\/body>/im).exec(txt)[0]
                   .replace('<body', '<div').replace('</body>', '</div>')).eq(0).html();
        }
        else {
            return (/<body[^>]*>((.|[\n\r])*)<\/body>/im).exec(txt)[1];
        }
    },
    setId: function($el, prefix){
      if(prefix === undefined){
        prefix = 'id';
      }
      var id = $el.attr('id');
      if(id === undefined){
        id = prefix + (Math.floor((1 + Math.random()) * 0x10000)
          .toString(16).substring(1));
      } else {
        /* hopefully we don't screw anything up here... changing the id
         * in some cases so we get a decent selector */
        id = id.replace(/\./g, '-');
      }
      $el.attr('id', id);
      return id;
    },
    bool: function(val){
      if(typeof(val) === 'string'){
        val = $.trim(val).toLowerCase();
      }
      return ['true', true, 1].indexOf(val) !== -1;
    },
    updateQueryString: function(key, value, url) {
    if (!url) url = window.location.href;
        var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi");

        if (re.test(url)) {
            if (typeof value !== 'undefined' && value !== null)
                return url.replace(re, '$1' + key + "=" + value + '$2$3');
            else {
                var hash = url.split('#');
                url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
                return url;
            }
        }
        else {
            if (typeof value !== 'undefined' && value !== null) {
                var separator = url.indexOf('?') !== -1 ? '&' : '?',
                    hash = url.split('#');
                url = hash[0] + separator + key + '=' + value;
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
                return url;
            }
            else
                return url;
        }
    }
  };

  return utils;

});
