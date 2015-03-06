define(['jquery'], function($) {
    "use strict";
    var IconHover = function($el, $container) {
        this.$el = $el;
        this.$container = $container;
        this.out = true;
    };
    IconHover.prototype.setImage = function(src, e) {
        var self = this;
        this.out = false;

        var $img = $('img', this.$el);
        if ($img.attr('src') !== src) {
            self.hide();
            $img
                .removeAttr('src')
                .load(function() {
                    self.setPosition(e);
                })
                .attr('src', src);
        }
        else {
            self.setPosition(e);
        }
    };

    IconHover.prototype.setPosition = function(e) {
        var parent = $(e.target).parent();
        this.$el.css({
            top: parent.offset().top - this.$container.offset().top - this.$el.height() - 10,
            left: $(e.target).offset().left - this.$container.offset().left + e.offsetX - (this.$el.width()/2)
        });
        this.show();
    };

    IconHover.prototype.show = function() {
        this.$el.show();
    };

    IconHover.prototype.hide = function() {
        var self = this;
        self.out = true;
        setTimeout(function() {
            if (self.out) {
                self.$el.hide();
            }
        }, 200);
    };

    return IconHover;
});
