;(function ($) {
  /* textWidth and autoresize: https://stackoverflow.com/questions/8100770/auto-scaling-inputtype-text-to-width-of-value */
  $.fn.textWidth = function(_text, _font) {
    var fakeEl = $('<span>').hide().appendTo(document.body).text(_text || this.val() || this.text()).css({font: _font || this.css('font'), whiteSpace: "pre"}),
          width = fakeEl.width();
      fakeEl.remove();
      return width;
  }

  // resizes elements based on content size.  usage: $('input').autoresize({padding:10,minWidth:0,maxWidth:100});
  $.fn.autoresize = function(options){
    options = $.extend({padding:0,minWidth:0,maxWidth:10000}, options || {});
    $(this).on('input', function() {
      $(this).css('width', Math.min(options.maxWidth,Math.max(options.minWidth,$(this).textWidth() + options.padding)));
    }).trigger('input');
    return this;
  }

  $.fn.inputTag = function( o ) {

    var defaults = {
      max: -1,
      delimiter: ',',
      repeat: true,
      onAddItem: function(text) {},
      onChange: function(data) {},
      addItemText: function(value) { return 'Aperte enter para adicionar <b>'+value+'</b>'}
    }
    o = $.extend(defaults, o || {});
    if( this.length != 1 ) { return this.each(function(index, el){ $(el).inputTag(o); });}
    $.extend( this, {
      init: function() {
        var $self = $(this),
            self = this;

        this.initWrapper();
        this.initDropdown();
        this.initInput();

        if($self.data('items')) {
          this.items = $self.data('items').split(',');
        }

        if( $self.val() !== '' ) {
          $self.val().split(o.delimiter).map(function(value) {
            self.addItem(value);
          })
        }

      },
      initWrapper: function() {
        var $self = $(this),
            self = this;
        $self.hide();
        var attrCss = $self.css(['border','padding','margin','border-radius']);
        this.radius = attrCss['border-radius'];
        var required = $self.attr('required');
        this.required = required;
        var tag = '';
        if( required ) {
          tag = 'required';
        }

        $self.wrap('<div class="main--wrapper"><div class="inputtag--wrapper"></div></div>');

        var $wrapper = $self.closest('.inputtag--wrapper');
        var $input = $('<input class="input--clone" type="text" '+tag+'/>');


        $wrapper.append($input);
        $wrapper.css(attrCss);
        $wrapper.on('inputtag.change', function() {
          var data = self.data();
          $self.val(data);
          o.onChange(data);
          $input.attr('required', (self.required && data.length == 0));
        });
      },
      initInput: function() {
        var $self = $(this),
            $input = this.getInput(),
            paddingLeft = $self.css('padding-right').replace(/[^-\d\.]/g, ''),
            self = this,
            $dropdown = this.getDropdown(),
            $wrapper = this.getWrapper();

        var placeholder = $self.attr('placeholder');
        if( placeholder ) {
          $input.attr('placeholder', placeholder);
        }
        $input.on("keypress", function(e) {
          if( e.keyCode == 13 ) {
            self.addItem($(this).val(), true);
            return false;
          }
        });

        $input.on("keyup", function(e) {
          self.textSearch = e.target.value;
          $dropdown.trigger( "search", self.textSearch );
          if( self.textSearch.length > 0 ) {
            self.showDropdown();
          } else {
            self.hideDropdown();
          }
        })
        $input.on('keydown',function (e) {
          var key = e.keyCode || e.charCode;
          if ((key == 8 || key == 46) && $input.val() === '') {
              e.preventDefault();
              e.stopPropagation();
              var $prev = $input.prev();
              if( $prev.hasClass('item') ) {
                $input.val($prev.text());
                $prev.remove();
                self.showDropdown();
              }
          }
        });
        $input.autoresize({padding: 0, maxWidth: $wrapper.width()});
      },
      getInput: function() {
        return $(this).parent().find('.input--clone');
      },
      getWrapper: function() {
        return $(this).closest('.inputtag--wrapper');
      },
      getDropdown: function() {
        return this.getWrapper().next();
      },
      initDropdown: function() {
        var $self = $(this),
            $input = this.getInput(),
            paddingLeft = $self.css('padding-right').replace(/[^-\d\.]/g, ''),
            self = this,
            $wrapper = this.getWrapper();
        $wrapper.after('<div class="inputtag__list--dropdown"><ul></ul></div>');
        $wrapper.on('click', function() {
          $input.focus();
        });
        var $dropdown = $wrapper.siblings('.inputtag__list--dropdown');
        $dropdown.width($wrapper.outerWidth() - 2);
        $dropdown.css('border-color', $wrapper.css('border-color'));

        $dropdown.on("click",'ul li.item', function(e) {
          self.addItem($(this).data('text'), true);
          if( self.isShow ) self.hideDropdown()
        })

        $dropdown.on("search", function(e) {
          self.clearDropdownSearchList();
          if( !self.items ) {
            self.notFound(); return;
          }
          var items = self.items.filter(function(obj) {
            return obj.toLowerCase().indexOf(self.textSearch.toLowerCase()) >= 0;
          });

          if( items.length > 0 ) {
            items.map(function(obj) {
              self.addDropdownItem(obj);
            })
          } else {
            self.notFound();
          }
        });
      },
      data: function() {
        return $.map(this.getWrapper().find('.item').toArray(),function(i,el) {
          return $(i).text();
        })
      },
      countItems: function() {
        return this.getWrapper().find('.item').length;
      },
      addItem: function(text, change ) {
        if(text !== '' && ( o.max == -1 || this.countItems() < o.max )) {
          var $input = this.getInput(),
              self = this;

          $input.val('');
          this.hideDropdown();

          if ( !o.repeat && this.data().find( function(el) {
            return el == text;
          } ) ) {
            return;
          }
          o.onAddItem(text);

          var $wrapper = self.getWrapper();

          $input.before('<div class="item">'+text+'<span class="remove"><i class="icon"></i></span></div>');
          $wrapper.find('.remove').on('click', function(e) {
            $(this).parent().remove();
            $wrapper.trigger('inputtag.change');
            $input.focus();
          });
          change && $wrapper.trigger('inputtag.change');
          $input.focus();
        }
      },
      notFound: function() {
        var $list = this.getDropdown().find('ul');
        $list.append('<li class="item" data-text="'+this.textSearch+'">'+o.addItemText(this.textSearch)+'</li>');
      },
      clearDropdownSearchList: function() {
        var $list = this.getDropdown().find('ul li');
        $list.off();
        $list.remove();
      },
      addDropdownItem: function( item ) {
        var $list = this.getDropdown().find('ul');
        var regex = new RegExp(this.textSearch, "i");
        $list.append('<li class="item" data-text="'+item+'">'+item.replace(regex, function(matched) { return "<b>"+matched+"</b>"})+'</li>');
      },
      showDropdown: function() {
        var $dropdown = this.getDropdown(),
            $wrapper = this.getWrapper();
        this.isShow = true;
        $dropdown.css('display','block');
        $wrapper.css('border-bottom-left-radius',0);
        $wrapper.css('border-bottom-right-radius',0);
      },
      hideDropdown: function() {
        this.isShow = false;
        var $dropdown = this.getDropdown(),
            $wrapper = this.getWrapper();
        $dropdown.css('display','none');
        $wrapper.css('border-bottom-left-radius',this.radius);
        $wrapper.css('border-bottom-right-radius',this.radius);
      },
    });
    return this.init();
  };
})(jQuery);
