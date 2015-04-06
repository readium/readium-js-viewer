/*!
 * Bootstrap v3.3.4 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}

+function ($) {
  'use strict';
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1)) {
    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher')
  }
}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.4
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.4
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.4'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.4
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.4'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target)
      if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
      Plugin.call($btn, 'toggle')
      e.preventDefault()
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.4
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.4'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.4
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.4'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.4
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.4'

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--                        // up
    if (e.which == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '[role="menu"]', Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '[role="listbox"]', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.4
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.4'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.4
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.4'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (self && self.$tip && self.$tip.is(':visible')) {
      self.hoverState = 'in'
      return
    }

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var $container   = this.options.container ? $(this.options.container) : this.$element.parent()
        var containerDim = this.getPosition($container)

        placement = placement == 'bottom' && pos.bottom + actualHeight > containerDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < containerDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > containerDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < containerDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type)
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var elOffset  = isBody ? { top: 0, left: 0 } : $element.offset()
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template))
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.4
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.4'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.4
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.4'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.4
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.VERSION = '3.3.4'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && (($active.length && $active.hasClass('fade')) || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.3.4
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.4'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = $(document.body).height()

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

define("bootstrap", ["jquery"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.bootstrap;
    };
}(this)));

/* ========================================================================
* Extends Bootstrap v3.1.1

* Copyright (c) <2014> eBay Software Foundation

* All rights reserved.

* Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

* Neither the name of eBay or any of its subsidiaries or affiliates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
* ======================================================================== */

(function($) {
  "use strict";

  var uniqueId = function(prefix) {
      return (prefix || 'ui-id') + '-' + Math.floor((Math.random()*1000)+1)
  }

  // Alert Extension
  // ===============================

    $('.alert').attr('role', 'alert')
    $('.close').removeAttr('aria-hidden').wrapInner('<span aria-hidden="true"></span>').append('<span class="sr-only">Close</span>')

  // TOOLTIP Extension
  // ===============================

    var showTooltip =    $.fn.tooltip.Constructor.prototype.show
        , hideTooltip =    $.fn.tooltip.Constructor.prototype.hide

    $.fn.tooltip.Constructor.prototype.show = function () {
        showTooltip.apply(this, arguments)
        var $tip = this.tip()
            , tooltipID = $tip.attr('id') || uniqueId('ui-tooltip')
        $tip.attr({'role':'tooltip','id' : tooltipID})
        this.$element.attr('aria-describedby', tooltipID)
    }

    $.fn.tooltip.Constructor.prototype.hide = function () {
        hideTooltip.apply(this, arguments)
        removeMultiValAttributes(this.$element, 'aria-describedby', this.tip().attr('id'))
        return this
    }

  // Popover Extension
  // ===============================
    var showPopover =   $.fn.popover.Constructor.prototype.setContent
      , hideTPopover =   $.fn.popover.Constructor.prototype.hide

    $.fn.popover.Constructor.prototype.setContent = function(){
      showPopover.apply(this, arguments)
      var $tip = this.tip()
        , tooltipID = $tip.attr('id') || uniqueId('ui-tooltip')
      $tip.attr({'role':'alert','id' : tooltipID})
      this.$element.attr('aria-describedby', tooltipID)
      this.$element.focus()
    }
    $.fn.popover.Constructor.prototype.hide =  function(){
        hideTooltip.apply(this, arguments)
        removeMultiValAttributes(this.$element, 'aria-describedby', this.tip().attr('id'))
    }

  //Modal Extension
    $('.modal-dialog').attr( {'role' : 'document'})
    var modalhide =   $.fn.modal.Constructor.prototype.hide
    $.fn.modal.Constructor.prototype.hide = function(){
       var modalOpener = this.$element.parent().find('[data-target="#' + this.$element.attr('id') + '"]')
       modalhide.apply(this, arguments)
       modalOpener.focus()
    }

  // DROPDOWN Extension
  // ===============================

    var toggle   = '[data-toggle=dropdown]'
      , $par
      , firstItem
      , focusDelay = 200
      , menus = $(toggle).parent().find('ul').attr('role','menu')
      , lis = menus.find('li').attr('role','presentation')

    lis.find('a').attr({'role':'menuitem', 'tabIndex':'-1'})
    $(toggle).attr({ 'aria-haspopup':'true', 'aria-expanded': 'false'})

    $(toggle).parent().on('shown.bs.dropdown',function(e){
      $par = $(this)
      var $toggle = $par.find(toggle)
      $toggle.attr('aria-expanded','true')

      setTimeout(function(){
            firstItem = $('.dropdown-menu [role=menuitem]:visible', $par)[0]
            try{ firstItem.focus()} catch(ex) {}
      }, focusDelay)
    })

    $(toggle).parent().on('hidden.bs.dropdown',function(e){
      $par = $(this)
      var $toggle = $par.find(toggle)
      $toggle.attr('aria-expanded','false')
    })

    //Adding Space Key Behaviour, opens on spacebar
    $.fn.dropdown.Constructor.prototype.keydown = function (e) {
      var  $par
        , firstItem
      if (!/(32)/.test(e.keyCode)) return
        $par = $(this).parent()
        $(this).trigger ("click")
        e.preventDefault() && e.stopPropagation()
    }

    $(document)
      .on('focusout.dropdown.data-api', '.dropdown-menu', function(e){
        var $this = $(this)
                    , that = this
        setTimeout(function() {
         if(!$.contains(that, document.activeElement)){
          $this.parent().removeClass('open')
          $this.parent().find('[data-toggle=dropdown]').attr('aria-expanded','false')
         }
        }, 150)
       })
      .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]' , $.fn.dropdown.Constructor.prototype.keydown)


  // Tab Extension
  // ===============================

    var $tablist = $('.nav-tabs')
        , $lis = $tablist.children('li')
        , $tabs = $tablist.find('[data-toggle="tab"], [data-toggle="pill"]')

    $tablist.attr('role', 'tablist')
    $lis.attr('role', 'presentation')
    $tabs.attr('role', 'tab')

    $tabs.each(function( index ) {
      var tabpanel = $($(this).attr('href'))
        , tab = $(this)
        , tabid = tab.attr('id') || uniqueId('ui-tab')

        tab.attr('id', tabid)

      if(tab.parent().hasClass('active')){
        tab.attr( { 'tabIndex' : '0', 'aria-expanded' : 'true', 'aria-selected' : 'true', 'aria-controls': tab.attr('href').substr(1) } )
        tabpanel.attr({ 'role' : 'tabpanel', 'tabIndex' : '0', 'aria-hidden' : 'false', 'aria-labelledby':tabid })
      }else{
        tab.attr( { 'tabIndex' : '-1', 'aria-expanded' : 'false', 'aria-selected' : 'false', 'aria-controls': tab.attr('href').substr(1) } )
        tabpanel.attr( { 'role' : 'tabpanel', 'tabIndex' : '-1', 'aria-hidden' : 'true', 'aria-labelledby':tabid } )
      }
    })

    $.fn.tab.Constructor.prototype.keydown = function (e) {
      var $this = $(this)
      , $items
      , $ul = $this.closest('ul[role=tablist] ')
      , index
      , k = e.which || e.keyCode

      $this = $(this)
      if (!/(37|38|39|40)/.test(k)) return

      $items = $ul.find('[role=tab]:visible')
      index = $items.index($items.filter(':focus'))

      if (k == 38 || k == 37) index--                         // up & left
      if (k == 39 || k == 40) index++                        // down & right


      if(index < 0) index = $items.length -1
      if(index == $items.length) index = 0

      var nextTab = $items.eq(index)
      if(nextTab.attr('role') ==='tab'){

        nextTab.tab('show')      //Comment this line for dynamically loaded tabPabels, to save Ajax requests on arrow key navigation
        .focus()
      }
      // nextTab.focus()

      e.preventDefault()
      e.stopPropagation()
    }

    $(document).on('keydown.tab.data-api','[data-toggle="tab"], [data-toggle="pill"]' , $.fn.tab.Constructor.prototype.keydown)

   var tabactivate =    $.fn.tab.Constructor.prototype.activate;
   $.fn.tab.Constructor.prototype.activate = function (element, container, callback) {
      var $active = container.find('> .active')
      $active.find('[data-toggle=tab]').attr({ 'tabIndex' : '-1','aria-selected' : false,'aria-expanded' : false })
      $active.filter('.tab-pane').attr({ 'aria-hidden' : true,'tabIndex' : '-1' })

      tabactivate.apply(this, arguments)

      element.addClass('active')
      element.find('[data-toggle=tab]').attr({ 'tabIndex' : '0','aria-selected' : true,'aria-expanded' : true })
      element.filter('.tab-pane').attr({ 'aria-hidden' : false,'tabIndex' : '0' })
   }


  // Collapse Extension
  // ===============================

      var $colltabs =  $('[data-toggle="collapse"]')
      $colltabs.attr({ 'role':'tab', 'aria-selected':'false', 'aria-expanded':'false' })
      $colltabs.each(function( index ) {
        var colltab = $(this)
        , collpanel = (colltab.attr('data-target')) ? $(colltab.attr('data-target')) : $(colltab.attr('href'))
        , parent  = colltab.attr('data-parent')
        , collparent = parent && $(parent)
        , collid = colltab.attr('id') || uniqueId('ui-collapse')

        $(collparent).find('div:not(.collapse,.panel-body), h4').attr('role','presentation')

          colltab.attr('id', collid)
          if(collparent){
            collparent.attr({ 'role' : 'tablist', 'aria-multiselectable' : 'true' })
            if(collpanel.hasClass('in')){
              colltab.attr({ 'aria-controls': colltab.attr('href').substr(1), 'aria-selected':'true', 'aria-expanded':'true', 'tabindex':'0' })
              collpanel.attr({ 'role':'tabpanel', 'tabindex':'0', 'aria-labelledby':collid, 'aria-hidden':'false' })
            }else{
              colltab.attr({'aria-controls' : colltab.attr('href').substr(1), 'tabindex':'-1' })
              collpanel.attr({ 'role':'tabpanel', 'tabindex':'-1', 'aria-labelledby':collid, 'aria-hidden':'true' })
            }
          }
      })

    var collToggle = $.fn.collapse.Constructor.prototype.toggle
    $.fn.collapse.Constructor.prototype.toggle = function(){
        var prevTab = this.$parent && this.$parent.find('[aria-expanded="true"]') , href

        if(prevTab){
          var prevPanel = prevTab.attr('data-target') || (href = prevTab.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
          , $prevPanel = $(prevPanel)
          , $curPanel = this.$element
          , par = this.$parent
          , curTab

        if (this.$parent) curTab = this.$parent.find('[data-toggle=collapse][href="#' + this.$element.attr('id') + '"]')

        collToggle.apply(this, arguments)

        if ($.support.transition) {
          this.$element.one($.support.transition.end, function(){

              prevTab.attr({ 'aria-selected':'false','aria-expanded':'false', 'tabIndex':'-1' })
              $prevPanel.attr({ 'aria-hidden' : 'true','tabIndex' : '-1'})

              curTab.attr({ 'aria-selected':'true','aria-expanded':'true', 'tabIndex':'0' })

              if($curPanel.hasClass('in')){
                $curPanel.attr({ 'aria-hidden' : 'false','tabIndex' : '0' })
              }else{
                curTab.attr({ 'aria-selected':'false','aria-expanded':'false'})
                $curPanel.attr({ 'aria-hidden' : 'true','tabIndex' : '-1' })
              }
          })
        }
      }else{
        collToggle.apply(this, arguments)
      }
    }

    $.fn.collapse.Constructor.prototype.keydown = function (e) {
      var $this = $(this)
      , $items
      , $tablist = $this.closest('div[role=tablist] ')
      , index
      , k = e.which || e.keyCode

      $this = $(this)
      if (!/(32|37|38|39|40)/.test(k)) return
      if(k==32) $this.click()

      $items = $tablist.find('[role=tab]')
      index = $items.index($items.filter(':focus'))

      if (k == 38 || k == 37) index--                                        // up & left
      if (k == 39 || k == 40) index++                        // down & right
      if(index < 0) index = $items.length -1
      if(index == $items.length) index = 0

      $items.eq(index).focus()

      e.preventDefault()
      e.stopPropagation()

    }

    $(document).on('keydown.collapse.data-api','[data-toggle="collapse"]' ,  $.fn.collapse.Constructor.prototype.keydown)

  // Carousel Extension
  // ===============================

      $('.carousel').each(function (index) {
        var $this = $(this)
          , prev = $this.find('[data-slide="prev"]')
          , next = $this.find('[data-slide="next"]')
          , $options = $this.find('.item')
          , $listbox = $options.parent()

        $this.attr( { 'data-interval' : 'false', 'data-wrap' : 'false' } )
        $listbox.attr('role', 'listbox')
        $options.attr('role', 'option')

        var spanPrev = document.createElement('span')
        spanPrev.setAttribute('class', 'sr-only')
        spanPrev.innerHTML='Previous'

        var spanNext = document.createElement('span')
        spanNext.setAttribute('class', 'sr-only')
        spanNext.innerHTML='Next'

        prev.attr('role', 'button')
        next.attr('role', 'button')

        prev.append(spanPrev)
        next.append(spanNext)

        $options.each(function () {
          var item = $(this)
          if(item.hasClass('active')){
            item.attr({ 'aria-selected': 'true', 'tabindex' : '0' })
          }else{
            item.attr({ 'aria-selected': 'false', 'tabindex' : '-1' })
          }
        })
      })

      var slideCarousel = $.fn.carousel.Constructor.prototype.slide
      $.fn.carousel.Constructor.prototype.slide = function (type, next) {
        var $active = this.$element.find('.item.active')
          , $next = next || $active[type]()

        slideCarousel.apply(this, arguments)

      $active
        .one($.support.transition.end, function () {
        $active.attr({'aria-selected':false, 'tabIndex': '-1'})
        $next.attr({'aria-selected':true, 'tabIndex': '0'})
        //.focus()
       })
      }

    $.fn.carousel.Constructor.prototype.keydown = function (e) {
     var $this = $(this)
      , $ul = $this.closest('div[role=listbox]')
      , $items = $ul.find('[role=option]')
      , $parent = $ul.parent()
      , k = e.which || e.keyCode
      , index
      , i

      if (!/(37|38|39|40)/.test(k)) return

      index = $items.index($items.filter('.active'))
      if (k == 37 || k == 38) {                           //  Up
        $parent.carousel('prev')
        index--
        if(index < 0) index = $items.length -1
        else  $this.prev().focus()

      }
      if (k == 39 || k == 40) {                          // Down
        $parent.carousel('next')
        index++
        if(index == $items.length) index = 0
        else  {
          $this.one($.support.transition.end, function () {
            $this.next().focus()
          })
        }

      }

      e.preventDefault()
      e.stopPropagation()
    }
    $(document).on('keydown.carousel.data-api', 'div[role=option]', $.fn.carousel.Constructor.prototype.keydown)

  // GENERAL UTILITY FUNCTIONS
  // ===============================

    var removeMultiValAttributes = function (el, attr, val) {
     var describedby = (el.attr( attr ) || "").split( /\s+/ )
        , index = $.inArray(val, describedby)
     if ( index !== -1 ) {
       describedby.splice( index, 1 )
     }
     describedby = $.trim( describedby.join( " " ) )
     if (describedby ) {
       el.attr( attr, describedby )
     } else {
      el.removeAttr( attr )
     }
    }


})(jQuery);

define("bootstrapA11y", ["bootstrap"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.bootstrapA11y;
    };
}(this)));

/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define('spin',factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
    if(s[prop] !== undefined) return prop
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: '50%',           // center vertically
    left: '50%',          // center horizontally
    position: 'absolute'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})

      css(el, {
        left: o.left,
        top: o.top
      })
        
      if (target) {
        target.insertBefore(el, target.firstChild||null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

define('Spinner',['spin'], function(Spinner){
	var opts = {
      lines: 17, // The number of lines to draw
      length: 0, // The length of each line
      width: 10, // The line thickness
      radius: 48, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 66, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };
    return new Spinner(opts);
});
define('storage/Settings',[],function(){
    
    // localStorage may be disabled due to zero-quota issues (e.g. iPad in private browsing mode)
    var _isLocalStorageEnabled = undefined;
    var isLocalStorageEnabled = function() {
        if (_isLocalStorageEnabled) return true;
        if (typeof _isLocalStorageEnabled === "undefined") {
            _isLocalStorageEnabled = false;
            if (localStorage) {
                try {
                    localStorage.setItem("_isLocalStorageEnabled", "?");
                    localStorage.removeItem("_isLocalStorageEnabled");
                    _isLocalStorageEnabled = true;
                } catch(e) {
                }
            }
            return _isLocalStorageEnabled;
        } else {
            return false;
        }
    };
    
	Settings = {
		put : function(key, val, callback){
            if (!isLocalStorageEnabled()) {
                if (callback) callback();
                return;
            }
            
            var val = JSON.stringify(val);
			localStorage[key] = val;
            
			if (callback){
				callback();
			}
		},
		get : function(key, callback){
            if (!isLocalStorageEnabled()) {
                if (callback) callback(null);
                return;
            }
            
			var val = localStorage[key];
			if (val){
				callback(JSON.parse(val));
			}
			else{
				callback(null);
			}
			
		},
		getMultiple : function(keys, callback){
            if (!isLocalStorageEnabled()) {
                if (callback) callback({});
                return;
            }
            
			var retVal = {};
			for (var i = 0; i < keys.length; i++){
				if (localStorage[keys[i]]){
					retVal[keys[i]] = localStorage[keys[i]];
				}
			}
			callback(retVal);
		}
	}
	return Settings;
});

define('text!i18n/_locales/de/messages.json',[],function () { return '{ "about": {\r\n    "message": "Über Readium"\r\n    },\r\n    "preview": {\r\n        "message": "Vorschau"\r\n    },\r\n    "list_view": {\r\n        "message": "Listenansicht"\r\n    },\r\n    "thumbnail_view": {\r\n        "message": "Kachelansicht"\r\n    },\r\n    "view_library": {\r\n        "message": "Bibliothek"\r\n    },\r\n    "highlight_selection": {\r\n        "message": "Ausgewählten Text hervorheben"\r\n    },\r\n    "toc": {\r\n        "message": "Inhaltsverzeichnis"\r\n    },\r\n    "settings": {\r\n        "message": "Einstellungen"\r\n    },\r\n    "enter_fullscreen": {\r\n        "message": "Vollbildmodus"\r\n    },\r\n    "exit_fullscreen": {\r\n        "message": "Vollbildmodus verlassen"\r\n    },\r\n    "chrome_extension_name": {\r\n        "message": "Readium"\r\n    },\r\n    "chrome_extension_description": {\r\n        "message": "Ein Leseprogramm für EPUB3 Bücher."\r\n    },\r\n    "ok" : {\r\n        "message" : "Ok"\r\n    },\r\n    "i18n_readium_library": {\r\n        "message": "Readium Bibliothek"\r\n    },\r\n    "i18n_loading": {\r\n        "message": "Bibliothek wird geladen"\r\n    },\r\n    "i18n_readium_options": {\r\n        "message": "Readium Einstellungen:"\r\n    },\r\n    "i18n_save_changes": {\r\n        "message": "Änderungen speichern"\r\n    },\r\n    "i18n_close": {\r\n        "message": "Schließen"\r\n    },\r\n    "i18n_keyboard_shortcuts": {\r\n        "message": "Funktionstasten"\r\n    },\r\n    "i18n_keyboard_reload": {\r\n        "message": "Bitte laden Sie die Seite im Browser neu, damit die Änderungen der Tastaturkürzel wirksam werden."\r\n    },\r\n    "i18n_reset_key": {\r\n        "message": "Taste zurücksetzen"\r\n    },\r\n    "i18n_reset_key_all": {\r\n        "message": "Alle Funktionstasten auf Standard zurücksetzen"\r\n    },\r\n    "i18n_duplicate_keyboard_shortcut": {\r\n        "message": "Doppelbelegung"\r\n    },\r\n    "i18n_invalid_keyboard_shortcut": {\r\n        "message": "Nicht zulässig"\r\n    },\r\n    "i18n_paginate_all": {\r\n        "message": "Fließtext des EPUB Inhalts paginieren"\r\n    },\r\n    "i18n_automatically": {\r\n        "message": "*.epub URLs automatisch in Readium öffnen"\r\n    },\r\n    "i18n_show_warning": {\r\n        "message": "Warnhinweise beim Entpacken von EPUB Dateien anzeigen"\r\n    },\r\n    "i18n_details": {\r\n        "message": "Details"\r\n    },\r\n    "i18n_read": {\r\n        "message": "Lesen"\r\n    },\r\n    "i18n_delete": {\r\n        "message": "Löschen"\r\n    },\r\n    "i18n_are_you_sure": {\r\n        "message": "Möchten Sie diese Datei wirklich unwiderruflich löschen?"\r\n    },\r\n    "delete_dlg_title": {\r\n        "message": "Löschen bestätigen"\r\n    },\r\n\r\n    "i18n_auto_page_turn_enable": {\r\n        "message": "Automatisches Umblättern einschalten"\r\n    },\r\n    "i18n_auto_page_turn_disable": {\r\n        "message": "Automatisches Umblättern ausschalten"\r\n    },\r\n\r\n    "i18n_playback_scroll_enable": {\r\n        "message": "Scrollen während der Wiedergabe"\r\n    },\r\n    "i18n_playback_scroll_disable": {\r\n        "message": "Kein Scrollen während der Wiedergabe"\r\n    },\r\n    "i18n_audio_touch_enable": {\r\n        "message": "Touch-to-play einschalten"\r\n    },\r\n    "i18n_audio_touch_disable": {\r\n        "message": "Touch-to-play ausschalten"\r\n    },\r\n    "i18n_audio_highlight_default": {\r\n        "message": "Standard"\r\n    },\r\n    "i18n_audio_highlight": {\r\n        "message": "Hervorhebungsfarbe"\r\n    },\r\n\r\n    "delete_progress_title": {\r\n        "message": "Löschen wird ausgeführt"\r\n    },\r\n    "delete_progress_message": {\r\n        "message": "Löschen"\r\n    },\r\n    "migrate_dlg_title": {\r\n        "message": "Bücher migrieren"\r\n    },\r\n    "migrate_dlg_message": {\r\n        "message": "Daten werden geladen..."\r\n    },\r\n    "migrating": {\r\n        "message": "Migrieren..."\r\n    },\r\n    "replace_dlg_title": {\r\n        "message": "Konflikt festgestellt"\r\n    },\r\n    "replace_dlg_message": {\r\n        "message": "Soll das bestehende EPUB wirklich ersetzt werden?"\r\n    },\r\n    "import_dlg_title": {\r\n        "message": "EPUB importieren"\r\n    },\r\n    "import_dlg_message": {\r\n        "message": "EPUB Inhalt überprüfen..."\r\n    },\r\n    "storing_file": {\r\n        "message": "Datei speichern"\r\n    },\r\n    "err_unknown": {\r\n        "message": "Unbekannter Fehler. Für Details öffnen Sie die Konsole."\r\n    },\r\n    "err_storage": {\r\n        "message": "Zugriff auf Dateispeicher nicht möglich."\r\n    },\r\n    "err_epub_corrupt": {\r\n        "message": "Ungültiges oder beschädigtes EPUB Paket"\r\n    },\r\n    "err_dlg_title": {\r\n        "message": "Unerwarteter Fehler"\r\n    },\r\n    "replace" : {\r\n        "message": "Ersetzen"\r\n    },\r\n    "i18n_author": {\r\n        "message": "Autor: "\r\n    },\r\n    "i18n_publisher": {\r\n        "message": "Verlag: "\r\n    },\r\n    "i18n_source": {\r\n        "message": "Quelle: "\r\n    },\r\n    "i18n_pub_date": {\r\n        "message": "Veröffentlicht am: "\r\n    },\r\n    "i18n_modified_date": {\r\n        "message": "Zuletzt geändert am: "\r\n    },\r\n    "i18n_id": {\r\n        "message": "ID: "\r\n    },\r\n    "i18n_epub_version": {\r\n        "message": "EPUB Version: "\r\n    },\r\n    "i18n_created_at": {\r\n        "message": "Erstellt am: "\r\n    },\r\n    "i18n_format": {\r\n        "message": "Format: "\r\n    },\r\n    "i18n_added": {\r\n        "message": "Hinzugefügt am: "\r\n    },\r\n    "i18n_unknown": {\r\n        "message": "Unbekannt"\r\n    },\r\n    "i18n_sorry": {\r\n        "message": "Das aktuelle EPUB enthält für diesen Inhalt keine Media Overlays."\r\n    },\r\n    "i18n_add_items": {\r\n        "message": "Füge Werke zur Bibliothek hinzu."\r\n    },\r\n    "i18n_extracting": {\r\n        "message": "Entpacke: "\r\n    },\r\n    "i18n_add_book_to_readium_library": {\r\n        "message": "Buch zur Readium Bibliothek hinzufügen:"\r\n    },\r\n    "i18n_add_book": {\r\n        "message": "Buch hinzufügen"\r\n    },\r\n    "i18n_cancel": {\r\n        "message": "Abbrechen"\r\n    },\r\n    "i18n_from_the_web": {\r\n        "message": "Internet:"\r\n    },\r\n    "i18n_from_local_file": {\r\n        "message": "Lokale Datei:"\r\n    },\r\n    "i18n_enter_a_url": {\r\n        "message": "URL einer .epub Datei eingeben"\r\n    },\r\n    "i18n_unpacked_directory": {\r\n        "message": "Entpacktes Verzeichnis:"\r\n    },\r\n    "i18n_validate": {\r\n        "message": "Prüfe:"\r\n    },\r\n    "i18n_confirm_that_this_book": {\r\n        "message": "Bestätigung, dass dieses Buch mit EPUB Standards übereinstimmt"\r\n    },\r\n    "i18n_single_pages": {\r\n        "message": "Einzelseiten"\r\n    },\r\n    "i18n_double_pages": {\r\n        "message": "Doppelseiten"\r\n    },\r\n    "i18n_save_settings": {\r\n        "message": "Einstellungen speichern"\r\n    },\r\n    "i18n_font_size": {\r\n        "message": "Schriftgröße"\r\n    },\r\n    "i18n_margins": {\r\n        "message": "Rand"\r\n    },\r\n    "i18n_text_and_background_color": {\r\n        "message": "Text- und Hintergrundfarbe"\r\n    },\r\n    "i18n_author_theme": {\r\n        "message": "Vorgabe des Autors"\r\n    },\r\n    "i18n_black_and_white": {\r\n        "message": "Schwarzweiss"\r\n    },\r\n    "i18n_arabian_nights": {\r\n        "message": "Arabian Nights"\r\n    },\r\n    "i18n_sands_of_dune": {\r\n        "message": "Sands of Dune"\r\n    },\r\n    "i18n_ballard_blues": {\r\n        "message": "Ballard Blues"\r\n    },\r\n    "i18n_vancouver_mist": {\r\n        "message": "Vancouver Mist"\r\n    },\r\n    "i18n_display_format": {\r\n        "message": "Anzeigeformat"\r\n    },\r\n    "i18n_spread_auto": {\r\n        "message": "Automatisch"\r\n    },\r\n    "i18n_scroll_mode": {\r\n        "message": "Scroll Modus"\r\n    },\r\n    "i18n_scroll_mode_auto": {\r\n        "message": "Automatisch"\r\n    },\r\n    "i18n_scroll_mode_doc": {\r\n        "message": "Dokument"\r\n    },\r\n    "i18n_scroll_mode_continuous": {\r\n        "message": "Kontinuierlich"\r\n    },\r\n\r\n    "i18n_page_transition": {\r\n        "message": "Umblätter-Effekt"\r\n    },\r\n    "i18n_page_transition_none": {\r\n        "message": "Keiner"\r\n    },\r\n    "i18n_page_transition_fade": {\r\n        "message": "Fade"\r\n    },\r\n    "i18n_page_transition_slide": {\r\n        "message": "Slide"\r\n    },\r\n    "i18n_page_transition_swoosh": {\r\n        "message": "Swoosh"\r\n    },\r\n    "i18n_page_transition_butterfly": {\r\n        "message": "Butterfly"\r\n    },\r\n    "i18n_html_readium_tm_a_project": {\r\n        "message": "Readium für Chrome ist die Chrome Browser Erweiterung basierend auf ReadiumJS, einem Open-Source Lesesystem und einer JavaScript Bibliothek zur Darstellung von EPUB® Veröffentlichungen in Web-Browsern. ReadiumJS ist ein Projekt der Readium Foundation (Readium.org). Wenn Sie mehr darüber erfahren möchten oder das Projekt unterstützen wollen, besuchen Sie bitte die <a href=\\"http://readium.org/\\">Projekt Homepage</a>."\r\n\r\n    },\r\n    "gethelp": {\r\n        "message": "Falls Sie auf Probleme stoßen, Fragen haben oder \\"Hallo\\" sagen möchten, besuchen Sie <a href=\\"http://idpf.org/forums/readium\\">unser Forum</a>."\r\n    },\r\n    "i18n_toolbar": {\r\n        "message": "Werkzeugleiste"\r\n    },\r\n    "i18n_toolbar_show": {\r\n        "message": "Werkzeugleiste anzeigen"\r\n    },\r\n    "i18n_toolbar_hide": {\r\n        "message": "Werkzeugleiste ausblenden"\r\n    },\r\n    "i18n_audio_play": {\r\n        "message": "Audio - Abspielen"\r\n    },\r\n    "i18n_audio_pause": {\r\n        "message": "Audio - Pause"\r\n    },\r\n    "i18n_audio_play_background": {\r\n        "message": "Hintergrundaudio ein"\r\n    },\r\n    "i18n_audio_pause_background": {\r\n        "message": "Hintergrundaudio aus"\r\n    },\r\n    "i18n_audio_previous": {\r\n        "message": "Vorige Audiophrase"\r\n    },\r\n    "i18n_audio_next": {\r\n        "message": "Nächste Audiophrase"\r\n    },\r\n    "i18n_audio_volume": {\r\n        "message": "Lautstärke"\r\n    },\r\n    "i18n_audio_volume_increase": {\r\n        "message": "Lautstärke erhöhen"\r\n    },\r\n    "i18n_audio_volume_decrease": {\r\n        "message": "Lautstärke verringern"\r\n    },\r\n    "i18n_audio_time": {\r\n        "message": "Audio - Zeitmarke"\r\n    },\r\n    "i18n_audio_mute": {\r\n        "message": "Audio ausschalten"\r\n    },\r\n    "i18n_audio_unmute": {\r\n        "message": "Audio einschalten"\r\n    },\r\n    "i18n_audio_expand": {\r\n        "message": "Erweiterte Audio-Steuerung anzeigen"\r\n    },\r\n    "i18n_audio_collapse": {\r\n        "message": "Erweiterte Audio-Steuerung ausblenden"\r\n    },\r\n    "i18n_audio_esc": {\r\n        "message": "Aktuellen Audio-Bereich verlassen"\r\n    },\r\n    "i18n_audio_rate": {\r\n        "message": "Audio - Wiedergabegeschwindigkeit"\r\n    },\r\n    "i18n_audio_rate_increase": {\r\n        "message": "Audio - Wiedergabegeschwindigkeit erhöhen"\r\n    },\r\n    "i18n_audio_rate_decrease": {\r\n        "message": "Audio - Wiedergabegeschwindigkeit verringern"\r\n    },\r\n    "i18n_audio_rate_reset": {\r\n        "message": "Audio - Wiedergabegeschwindigkeit zurücksetzen"\r\n    },\r\n    "i18n_audio_skip_disable": {\r\n        "message": "Audio - Überspringen unterbinden "\r\n    },\r\n    "i18n_audio_skip_enable": {\r\n        "message": "Audio - Überspringen ermöglichen"\r\n    },\r\n    "i18n_audio_sync": {\r\n        "message": "Text-Audio-Synchronisation"\r\n    },\r\n    "i18n_audio_sync_default": {\r\n        "message": "Nach Vorgabe"\r\n    },\r\n    "i18n_audio_sync_word": {\r\n        "message": "Wort"\r\n    },\r\n    "i18n_audio_sync_sentence": {\r\n        "message": "Satz"\r\n    },\r\n    "i18n_audio_sync_paragraph": {\r\n        "message": "Absatz"\r\n    },\r\n    "i18n_page_previous": {\r\n        "message": "Vorige Seite"\r\n    },\r\n    "i18n_page_next": {\r\n        "message": "Nächste Seite"\r\n    },\r\n    "chrome_accept_languages": {\r\n        "message": "$CHROME$ akzeptiert $languages$ Sprachen",\r\n        "placeholders": {\r\n            "chrome": {\r\n                "content": "Chrome",\r\n                "example": "Chrome"\r\n            },\r\n            "languages": {\r\n                "content": "$1",\r\n                "example": "en-US,ja,sr,de,zh_CN"\r\n            }\r\n        }\r\n    }\r\n}';});


define('text!i18n/_locales/es/messages.json',[],function () { return '{\r\n\r\n    "chrome_extension_name": {\r\n        "message": "Readium"\r\n    },\r\n    "about" : {\r\n        "message" : "Acerca de"\r\n    },\r\n    "preview" : {\r\n        "message" : "Vista previa"\r\n    },\r\n    "list_view" : {\r\n        "message" : "Vista en lista"\r\n    },\r\n    "thumbnail_view" : {\r\n        "message" : "Vista en miniaturas"\r\n    },\r\n    "view_library": {\r\n        "message" : "Biblioteca"\r\n    },\r\n    "highlight_selection" : {\r\n        "message" : "Subrayar texto seleccionado"\r\n    },\r\n    "toc" : {\r\n        "message" : "Tabla de contenidos"\r\n    },\r\n    "settings" : {\r\n        "message" : "Preferencias"\r\n    },\r\n    "enter_fullscreen" : {\r\n        "message" : "Abrir modo de pantalla completa"\r\n    },\r\n    "exit_fullscreen" : {\r\n        "message" : "Cerrar modo de pantalla completa"\r\n    },\r\n    "chrome_extension_description": {\r\n        "message": "Lector de libros EPUB3."\r\n    },\r\n    "ok" : {\r\n        "message" : "Ok"\r\n    },\r\n    "delete_dlg_title" : {\r\n        "message" : "Confirmar eliminación"\r\n    },\r\n    "delete_progress_title" : {\r\n        "message" : "Eliminación en progreso"\r\n    },\r\n    "delete_progress_message" : {\r\n        "message" : "Eliminando"\r\n    },\r\n    "migrate_dlg_title" : {\r\n        "message" : "Migrando libros"\r\n    },\r\n    "migrate_dlg_message" : {\r\n        "message" : "Cargando datos..."\r\n    },\r\n    "migrating" : {\r\n        "message" : "Migrando"\r\n    },\r\n    "replace_dlg_title" : {\r\n        "message": "Se ha detectado un conflicto"\r\n    },\r\n    "replace_dlg_message": {\r\n        "message": "Si decide continuar, el siguiente epub será reemplazado por el que está siendo importado"\r\n    },\r\n    "import_dlg_title" : {\r\n        "message": "Importando EPUB"\r\n    },\r\n    "import_dlg_message" : {\r\n        "message": "Examinando contenido del EPUB..."\r\n    },\r\n    "storing_file" : {\r\n        "message": "Guardando archivo"\r\n    },\r\n    "err_unknown" : {\r\n        "message": "Error desconocido. Chequear la consola para conocer más detalles."\r\n    },\r\n    "err_storage" : {\r\n        "message": "No es posible acceder al dispositvo"\r\n    },\r\n    "err_epub_corrupt" : {\r\n        "message": "Paquete EPUB inválido o corrupto"\r\n    },\r\n    "err_dlg_title" : {\r\n        "message": "Error inesperado"\r\n    },\r\n    "replace" : {\r\n        "message": "Reemplazar"\r\n    },\r\n    "gethelp" : {\r\n        "message" : "Si encuentra algún problema, tiene preguntas, o le gustaría decir hola, visite <a href=\\"http://idpf.org/forums/readium\\">nuestro foro</a>"\r\n    },\r\n    "i18n_readium_library" : {\r\n        "message" : "Biblioteca Readium"\r\n    },\r\n    "i18n_loading" : {\r\n        "message" : "Cargando biblioteca"\r\n    },\r\n    "i18n_readium_options" : {\r\n        "message" : "Readium Opciones:"\r\n    },\r\n    "i18n_save_changes" : {\r\n        "message" : "Guardar cambios"\r\n    },\r\n    "i18n_close" : {\r\n        "message" : "Cerrar"\r\n    },\r\n    "i18n_keyboard_shortcuts" : {\r\n        "message" : "Teclas de acceso rápido"\r\n    },\r\n    "i18n_keyboard_reload" : {\r\n        "message" : "Por favor, actualiza la página para que las teclas de acceso rápido tengan efecto."\r\n    },\r\n    "i18n_reset_key" : {\r\n        "message" : "Reestablecer tecla"\r\n    },\r\n    "i18n_reset_key_all" : {\r\n        "message" : "Reestablecer todos las teclas de acceso rápido"\r\n    },\r\n    "i18n_duplicate_keyboard_shortcut" : {\r\n        "message" : "DUPLICADO"\r\n    },\r\n    "i18n_invalid_keyboard_shortcut" : {\r\n        "message" : "INVALIDO"\r\n    },\r\n    "i18n_paginate_all" : {\r\n        "message" : "Paginar todo el contenido ePUB repaginable"\r\n    },\r\n    "i18n_automatically" : {\r\n        "message" : "Abrir automáticamente urls *.epub en readium"\r\n    },\r\n    "i18n_show_warning" : {\r\n        "message" : "Mostrar advertencias al desempaquetar archivos EPUB"\r\n    },\r\n    "i18n_details" : {\r\n        "message" : "Detalles"\r\n    },\r\n    "i18n_read" : {\r\n        "message" : "Leer"\r\n    },\r\n    "i18n_delete" : {\r\n        "message" : "Eliminar"\r\n    },\r\n    "i18n_author" : {\r\n        "message" : "Autor: "\r\n    },\r\n    "i18n_publisher" : {\r\n        "message" : "Editor: "\r\n    },\r\n    "i18n_source" : {\r\n        "message" : "Fuente: "\r\n    },\r\n    "i18n_pub_date" : {\r\n        "message" : "Fecha de publicación: "\r\n    },\r\n    "i18n_modified_date" : {\r\n        "message" : "Fecha de modificación: "\r\n    },\r\n    "i18n_id" : {\r\n        "message" : "ID: "\r\n    },\r\n    "i18n_epub_version" : {\r\n        "message" : "Versión EPUB: "\r\n    },\r\n    "i18n_created_at" : {\r\n        "message" : "Creado en: "\r\n    },\r\n    "i18n_format" : {\r\n        "message" : "Formato: "\r\n    },\r\n    "i18n_added" : {\r\n        "message" : "Añadido: "\r\n    },\r\n    "i18n_unknown" : {\r\n        "message" : "Desconocido"\r\n    },\r\n    "i18n_sorry" : {\r\n        "message" : "Disculpa, el EPUB actual no contiene superposición multimedia para este contenido"\r\n    },\r\n    "i18n_add_items" : {\r\n        "message" : "¡Añade aquí elementos a tu biblioteca!"\r\n    },\r\n    "i18n_extracting" : {\r\n        "message" : "extrayendo: "\r\n    },\r\n    "i18n_are_you_sure" : {\r\n        "message" : "¿Está seguro que desea eliminar de forma permanente"\r\n    },\r\n    "i18n_add_book_to_readium_library" : {\r\n        "message" : "Añadir libro a biblioteca Readium:"\r\n    },\r\n    "i18n_add_book" : {\r\n        "message" : "Añadir a la biblioteca"\r\n    },\r\n    "i18n_cancel" : {\r\n        "message" : "Cancelar"\r\n    },\r\n    "i18n_from_the_web" : {\r\n        "message" : "Desde la web:"\r\n    },\r\n    "i18n_from_local_file" : {\r\n        "message" : "Desde un archivo local:"\r\n    },\r\n    "i18n_enter_a_url" : {\r\n        "message" : "Ingresa una URL a un archivo .epub"\r\n    },\r\n    "i18n_unpacked_directory" : {\r\n        "message" : "Carpeta descomprimida:"\r\n    },\r\n    "i18n_validate" : {\r\n        "message" : "Validar:"\r\n    },\r\n    "i18n_confirm_that_this_book" : {\r\n        "message" : "Confirmar que este libro cumple con los estándares ePUB"\r\n    },\r\n    "i18n_single_pages" : {\r\n        "message" : "Páginas simple"\r\n    },\r\n    "i18n_double_pages" : {\r\n        "message" : "Páginas doble"\r\n    },\r\n    "i18n_save_settings" : {\r\n        "message" : "Guardar preferencias"\r\n    },\r\n    "i18n_font_size" : {\r\n        "message" : "TAMAÑO DE FUENTE"\r\n    },\r\n    "i18n_margins" : {\r\n        "message" : "MARGENES"\r\n    },\r\n    "i18n_text_and_background_color" : {\r\n        "message" : "COLOR DE FUENTE Y FONDO"\r\n    },\r\n    "i18n_black_and_white" : {\r\n        "message" : "Blanco y negro"\r\n    },\r\n    "i18n_arabian_nights" : {\r\n        "message" : "Las mil y una noches"\r\n    },\r\n    "i18n_sands_of_dune" : {\r\n        "message" : "Arenas de duna"\r\n    },\r\n    "i18n_ballard_blues" : {\r\n        "message" : "Ballard Blues"\r\n    },\r\n    "i18n_vancouver_mist" : {\r\n        "message" : "Bruma de Vancouver"\r\n    },\r\n    "i18n_display_format" : {\r\n        "message" : "MOSTRAR FORMATO"\r\n    },\r\n    "i18n_scroll_mode" : {\r\n        "message" : "MODO DE DESPLAZAMIENTO"\r\n    },\r\n    "i18n_scroll_mode_default" : {\r\n        "message" : "Por defecto"\r\n    },\r\n    "i18n_scroll_mode_doc" : {\r\n        "message" : "Documento"\r\n    },\r\n    "i18n_scroll_mode_continuous" : {\r\n        "message" : "Continuo"\r\n    },\r\n    "i18n_html_readium_tm_a_project" : {\r\n        "message" : "Readium para Chrome es la extensión para Chrome de ReadiumJS, un sistema de lectura de código abierto y librería JavaScript para renderizar publicaciones EPUB® en navegadores web. ReadiumJS es un proyecto de Readium Foundation (Readium.org). Para saber más o contribuir, visita el <a href=\\"http://readium.org/projects/readiumjs\\">sitio del proyecto</a>"\r\n    },\r\n    "i18n_toolbar_show" : {\r\n        "message" : "Mostrar barra de herramientas"\r\n    },\r\n    "i18n_toolbar_hide" : {\r\n        "message" : "Ocultar barra de herramientas"\r\n    },\r\n    "i18n_audio_play" : {\r\n        "message" : "Reproducir"\r\n    },\r\n    "i18n_audio_pause" : {\r\n        "message" : "Pausa"\r\n    },\r\n    "i18n_audio_previous" : {\r\n        "message" : "Frase de audio anterior"\r\n    },\r\n    "i18n_audio_next" : {\r\n        "message" : "Frase de audio siguiente"\r\n    },\r\n    "i18n_audio_volume" : {\r\n        "message" : "Volumen de audio"\r\n    },\r\n    "i18n_audio_volume_increase" : {\r\n        "message" : "Incrementar volumen de audio"\r\n    },\r\n    "i18n_audio_volume_decrease" : {\r\n        "message" : "Reducir volumen de audio"\r\n    },\r\n    "i18n_audio_time" : {\r\n        "message" : "Cursor de tiempo de audio"\r\n    },\r\n    "i18n_audio_mute" : {\r\n        "message" : "Desactivar audio"\r\n    },\r\n    "i18n_audio_unmute" : {\r\n        "message" : "Activar audio"\r\n    },\r\n    "i18n_audio_expand" : {\r\n        "message" : "Mostrar controles avanzados de audio"\r\n    },\r\n    "i18n_audio_collapse" : {\r\n        "message" : "Cerrar controles avanzados de audio"\r\n    },\r\n    "i18n_audio_esc" : {\r\n        "message" : "Salir de contexto actual de audio"\r\n    },\r\n    "i18n_audio_rate" : {\r\n        "message" : "Velocidad de reproducción de audio"\r\n    },\r\n    "i18n_audio_rate_increase" : {\r\n        "message" : "Incrementar velocidad de reproducción de audio"\r\n    },\r\n    "i18n_audio_rate_decrease" : {\r\n        "message" : "Reducir velocidad de reproducción de audio"\r\n    },\r\n    "i18n_audio_rate_reset" : {\r\n        "message" : "Reestablecer reproducción de audio a velocidad normal"\r\n    },\r\n    "i18n_audio_skip_disable" : {\r\n        "message" : "Desactivar capacidad de omisión"\r\n    },\r\n    "i18n_audio_skip_enable" : {\r\n        "message" : "Activar capacidad de omisión"\r\n    },\r\n    "i18n_audio_touch_enable" : {\r\n        "message" : "Activar touch-to-play"\r\n    },\r\n    "i18n_audio_touch_disable" : {\r\n        "message" : "Desactivar touch-to-play"\r\n    },\r\n    "i18n_audio_highlight_default" : {\r\n        "message" : "por defecto"\r\n    },\r\n    "i18n_audio_highlight" : {\r\n        "message" : "Color de audio"\r\n    },\r\n    "i18n_audio_sync" : {\r\n        "message" : "Granularidad de sincronización texto/audio"\r\n    },\r\n    "i18n_audio_sync_default" : {\r\n        "message" : "Por defecto"\r\n    },\r\n    "i18n_audio_sync_word" : {\r\n        "message" : "Palabra"\r\n    },\r\n    "i18n_audio_sync_sentence" : {\r\n        "message" : "Oración"\r\n    },\r\n    "i18n_audio_sync_paragraph" : {\r\n        "message" : "Párrafo"\r\n    },\r\n    "i18n_page_previous" : {\r\n        "message" : "Página previa"\r\n    },\r\n    "i18n_page_next" : {\r\n        "message" : "Página siguiente"\r\n    },\r\n    "i18n_author_theme" : {\r\n      "message" : "Por defecto (estilos de autor)"\r\n    },\r\n\r\n  "i18n_spread_auto" : {\r\n       "message" : "Automático"\r\n    },\r\n\r\n  "i18n_scroll_mode_auto" : {\r\n      "message" : "Automático"\r\n    },\r\n\r\n   "i18n_page_transition" : {\r\n      "message" : "EFECTOS DE PÁGINA"\r\n    },\r\n    "i18n_page_transition_none" : {\r\n      "message" : "Desactivado"\r\n    },\r\n    "i18n_page_transition_fade" : {\r\n      "message" : "Apagarse"\r\n    },\r\n    "i18n_page_transition_slide" : {\r\n      "message" : "Deslizar"\r\n    },\r\n    "i18n_page_transition_swoosh" : {\r\n      "message" : "Swoosh"\r\n    },\r\n    "i18n_page_transition_butterfly" : {\r\n      "message" : "Mariposa"\r\n    },\r\n\r\n  "i18n_toolbar" : {\r\n      "message" : "Barra de herramientas"\r\n    },\r\n\r\n   "i18n_audio_play_background" : {\r\n      "message" : "Reproducir pista en segundo plano"\r\n    },\r\n    "i18n_audio_pause_background" : {\r\n      "message" : "Pausar pista en segundo plano"\r\n},\r\n\r\n   "i18n_auto_page_turn_enable" : {\r\n      "message" : "Activar vuelta de página automática"\r\n    },\r\n    "i18n_auto_page_turn_disable" : {\r\n      "message" : "Desactivar vuelta de página automática"\r\n    },\r\n\r\n   "i18n_playback_scroll_enable" : {\r\n      "message" : "Activar desplazamiento durante la reproducción"\r\n    },\r\n\r\n    "i18n_playback_scroll_disable" : {\r\n      "message" : "Desactivar desplazamiento durante la reproducción"\r\n    },\r\n\r\n    "chrome_accept_languages": {\r\n        "message": "$CHROME$ acepta idiomas $languages$",\r\n        "placeholders": {\r\n            "chrome": {\r\n                "content": "Chrome",\r\n                "example": "Chrome"\r\n            },\r\n            "languages": {\r\n                "content": "$1",\r\n                "example": "en-US,ja,sr,de,zh_CN"\r\n            }\r\n        }\r\n    }\r\n}';});


define('text!i18n/_locales/en_US/messages.json',[],function () { return '{\r\n\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "about" : {\r\n    "message" : "About"\r\n  },\r\n  "preview" : {\r\n    "message" : "PREVIEW"\r\n  },\r\n  "list_view" : {\r\n    "message" : "List View"\r\n  },\r\n  "thumbnail_view" : {\r\n    "message" : "Thumbnail View"\r\n  },\r\n  "view_library": {\r\n    "message" : "Library"\r\n  },\r\n  "highlight_selection" : {\r\n    "message" : "Highlight Selected Text"\r\n  },\r\n  "toc" : {\r\n    "message" : "Table of Contents"\r\n  },\r\n  "settings" : {\r\n    "message" : "Settings"\r\n  },\r\n  "layout" : {\r\n    "message" : "Layout"\r\n  },\r\n  "style" : {\r\n    "message" : "Style"\r\n  },\r\n  "enter_fullscreen" : {\r\n    "message" : "Enter Fullscreen"\r\n  },\r\n  "exit_fullscreen" : {\r\n    "message" : "Exit Fullscreen"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "A reader for EPUB3 books."\r\n  },\r\n  "ok" : {\r\n    "message" : "Ok"\r\n  },\r\n  "delete_dlg_title" : {\r\n    "message" : "Confirm Delete"\r\n  },\r\n  "delete_progress_title" : {\r\n    "message" : "Delete in Progress"\r\n  },\r\n  "delete_progress_message" : {\r\n    "message" : "Deleting"\r\n  },\r\n  "migrate_dlg_title" : {\r\n    "message" : "Migrating Books"\r\n  },\r\n  "migrate_dlg_message" : {\r\n    "message" : "Loading data..."\r\n  },\r\n  "migrating" : {\r\n    "message" : "Migrating"\r\n  },\r\n  "replace_dlg_title" : {\r\n    "message": "Conflict Detected"\r\n  },\r\n  "replace_dlg_message": {\r\n    "message": "If you continue, the following epub will be replaced with the one you are importing"\r\n  },\r\n  "import_dlg_title" : {\r\n    "message": "Importing EPUB"\r\n  },\r\n  "import_dlg_message" : {\r\n    "message": "Examining EPUB content..."\r\n  },\r\n  "storing_file" : {\r\n    "message": "Storing file"\r\n  },\r\n  "err_unknown" : {\r\n    "message": "Unknown error. Check console for more details."\r\n  },\r\n  "err_storage" : {\r\n    "message": "Unable to access storage"\r\n  },\r\n  "err_epub_corrupt" : {\r\n    "message": "Invalid or corrupted EPUB package"\r\n  },\r\n  "err_ajax": {\r\n    "message": "Error in ajax request"\r\n  },\r\n  "err_dlg_title" : {\r\n    "message": "Unexpected Error"\r\n  },\r\n  "replace" : {\r\n    "message": "Replace"\r\n  },\r\n  "gethelp" : {\r\n    "message" : "If you encounter any problems, have questions, or would like to say hello, visit <a href=\\"http://idpf.org/forums/readium\\">our forum</a>"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readium Library"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readium Options:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Save changes"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Close"\r\n  },\r\n  "i18n_keyboard_shortcuts" : {\r\n    "message" : "Keyboard shortcuts"\r\n  },\r\n  "i18n_keyboard_reload" : {\r\n    "message" : "Please reload the page for keyboard shortcuts to take effect."\r\n  },\r\n  "i18n_reset_key" : {\r\n    "message" : "Reset key"\r\n  },\r\n  "i18n_reset_key_all" : {\r\n    "message" : "Reset all keyboard shortcuts"\r\n  },\r\n  "i18n_duplicate_keyboard_shortcut" : {\r\n    "message" : "DUPLICATE"\r\n  },\r\n  "i18n_invalid_keyboard_shortcut" : {\r\n    "message" : "INVALID"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Paginate all reflowable ePUB content"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Automatically open *.epub urls in readium"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Show warning messages when unpacking EPUB files"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Details"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Read"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Delete"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Author: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Publisher: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Source: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Pub Date: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Modified Date: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUB version: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Created at: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Format: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Added: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Unknown"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Sorry, the current EPUB does not contain a media overlay for this content"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Add items to your library here!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "extracting: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Are you sure you want to permanently delete "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Add Book To Readium Library:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Add to Library"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Cancel"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "From the web:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "From Local File:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Enter a URL to a .epub file"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Unpacked Directory:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Validate:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Confirm that this book complies with ePUB standards"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Single Pages"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Double Pages"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Save Settings"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "FONT SIZE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGINS"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "TEXT AND BACKGROUND COLOR"\r\n  },\r\n  "i18n_author_theme" : {\r\n    "message" : "Default (author styles)"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Black and White"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Arabian Nights"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Sands of Dune"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Ballard Blues"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Vancouver Mist"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "DISPLAY FORMAT"\r\n  },\r\n  "i18n_spread_auto" : {\r\n     "message" : "Auto"\r\n  },\r\n  "i18n_scroll_mode" : {\r\n    "message" : "SCROLL MODE"\r\n  },\r\n  "i18n_scroll_mode_auto" : {\r\n    "message" : "Auto"\r\n  },\r\n  "i18n_scroll_mode_doc" : {\r\n    "message" : "Document"\r\n  },\r\n  "i18n_scroll_mode_continuous" : {\r\n    "message" : "Continuous"\r\n  },\r\n  \r\n  "i18n_page_transition" : {\r\n    "message" : "PAGE EFFECTS"\r\n  },\r\n  "i18n_page_transition_none" : {\r\n    "message" : "Disabled"\r\n  },\r\n  "i18n_page_transition_fade" : {\r\n    "message" : "Fade"\r\n  },\r\n  "i18n_page_transition_slide" : {\r\n    "message" : "Slide"\r\n  },\r\n  "i18n_page_transition_swoosh" : {\r\n    "message" : "Swoosh"\r\n  },\r\n  "i18n_page_transition_butterfly" : {\r\n    "message" : "Butterfly"\r\n  },\r\n  \r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium for Chrome is the Chrome browser extension configuration of ReadiumJS, an open source reading system and JavaScript library for displaying EPUB® publications in web browsers. ReadiumJS is a project of the Readium Foundation (Readium.org). To learn more or to contribute, visit the <a href=\\"http://readium.org/projects/readiumjs\\">project homepage</a>"\r\n  },\r\n  "i18n_toolbar" : {\r\n    "message" : "Toolbar"\r\n  },\r\n  "i18n_toolbar_show" : {\r\n    "message" : "Show toolbar"\r\n  },\r\n  "i18n_toolbar_hide" : {\r\n    "message" : "Hide toolbar"\r\n  },\r\n  "i18n_audio_play" : {\r\n    "message" : "Play"\r\n  },\r\n  "i18n_audio_pause" : {\r\n    "message" : "Pause"\r\n  },\r\n  "i18n_audio_play_background" : {\r\n    "message" : "Play background track"\r\n  },\r\n  "i18n_audio_pause_background" : {\r\n    "message" : "Pause background track"\r\n  },\r\n  "i18n_audio_previous" : {\r\n    "message" : "Previous audio phrase"\r\n  },\r\n  "i18n_audio_next" : {\r\n    "message" : "Next audio phrase"\r\n  },\r\n  "i18n_audio_volume" : {\r\n    "message" : "Audio volume"\r\n  },\r\n  "i18n_audio_volume_increase" : {\r\n    "message" : "Increase audio volume"\r\n  },\r\n  "i18n_audio_volume_decrease" : {\r\n    "message" : "Decrease audio volume"\r\n  },\r\n  "i18n_audio_time" : {\r\n    "message" : "Audio time cursor"\r\n  },\r\n  "i18n_audio_mute" : {\r\n    "message" : "Mute audio"\r\n  },\r\n  "i18n_audio_unmute" : {\r\n    "message" : "Unmute audio"\r\n  },\r\n  "i18n_audio_expand" : {\r\n    "message" : "Show advanced audio controls"\r\n  },\r\n  "i18n_audio_collapse" : {\r\n    "message" : "Close advanced audio controls"\r\n  },\r\n  "i18n_audio_esc" : {\r\n    "message" : "Escape current audio context"\r\n  },\r\n  "i18n_audio_rate" : {\r\n    "message" : "Audio playback rate"\r\n  },\r\n  "i18n_audio_rate_increase" : {\r\n    "message" : "Increase audio playback rate"\r\n  },\r\n  "i18n_audio_rate_decrease" : {\r\n    "message" : "Decrease audio playback rate"\r\n  },\r\n  "i18n_audio_rate_reset" : {\r\n    "message" : "Reset audio playback to normal speed"\r\n  },\r\n  "i18n_audio_skip_disable" : {\r\n    "message" : "Disable skippability"\r\n  },\r\n  "i18n_audio_skip_enable" : {\r\n    "message" : "Enable skippability"\r\n  },\r\n\r\n  "i18n_auto_page_turn_enable" : {\r\n    "message" : "Enable automatic page turn"\r\n  },\r\n  "i18n_auto_page_turn_disable" : {\r\n    "message" : "Disable automatic page turn"\r\n  },\r\n\r\n  "i18n_playback_scroll_enable" : {\r\n    "message" : "Enable scroll during playback"\r\n  },\r\n  "i18n_playback_scroll_disable" : {\r\n    "message" : "Disable scroll during playback"\r\n  },\r\n  \r\n  "i18n_audio_touch_enable" : {\r\n    "message" : "Enable touch-to-play"\r\n  },\r\n  "i18n_audio_touch_disable" : {\r\n    "message" : "Disable touch-to-play"\r\n  },\r\n  "i18n_audio_highlight_default" : {\r\n    "message" : "default"\r\n  },\r\n  "i18n_audio_highlight" : {\r\n    "message" : "Audio color"\r\n  },\r\n  "i18n_audio_sync" : {\r\n    "message" : "Text/audio synchronization granularity"\r\n  },\r\n  "i18n_audio_sync_default" : {\r\n    "message" : "Default"\r\n  },\r\n  "i18n_audio_sync_word" : {\r\n    "message" : "Word"\r\n  },\r\n  "i18n_audio_sync_sentence" : {\r\n    "message" : "Sentence"\r\n  },\r\n  "i18n_audio_sync_paragraph" : {\r\n    "message" : "Paragraph"\r\n  },\r\n  "i18n_page_previous" : {\r\n    "message" : "Previous Page"\r\n  },\r\n  "i18n_page_next" : {\r\n    "message" : "Next Page"\r\n  },\r\n  "i18n_page_navigation" : {\r\n    "message" : "Page Navigation"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!i18n/_locales/fr/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "Un lecteur de livres numériques EPUB3."\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Bibliothèque Readium"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Chargement de la bibliothèque"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Options de Readium :"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Enregistrer les changements"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Fermer"\r\n  },\r\n  "i18n_keyboard_shortcuts" : {\r\n    "message" : "Raccourcis clavier"\r\n  },\r\n  "i18n_keyboard_reload" : {\r\n    "message" : "Veuillez recharger la page pour que les raccourcis clavier prennent effet."\r\n  },\r\n  "i18n_reset_key" : {\r\n    "message" : "Réinitialiser le raccourci clavier par défaut"\r\n  },\r\n  "i18n_reset_key_all" : {\r\n    "message" : "Réinitialiser tous les raccourcis clavier par défaut"\r\n  },\r\n  "i18n_duplicate_keyboard_shortcut" : {\r\n    "message" : "DUPLIQUE"\r\n  },\r\n  "i18n_invalid_keyboard_shortcut" : {\r\n    "message" : "INVALIDE"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Paginer tout le contenu des EPUB recomposables"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Ouvrir automatiquement les urls *.epub dans Readium"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Montrer les messages d\'avertissement pendant la décompression des fichiers EPUB"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Détails"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Lire"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Supprimer"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Auteur : "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Éditeur : "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Source : "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Date de publication :  "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Date de modification : "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "version de l\'EPUB : "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Ajouté le : "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Format : "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Ajouté le : "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Inconnu"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Désolé, l\'EPUB actuel ne contient pas de média associé (media overlay) pour ce contenu"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Ajoutez des articles à votre bibliothèque ici !"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "extraction : "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Voulez-vous vraiment supprimer "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Ajoutez un livre à la bibliothèque de Readium :"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Ajouter un livre"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Annuler"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "À partir du Web :"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "À partir d\'un fichier local :"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Entrez l\'URL d\'un fichier .epub"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Répertoire non-compressé :"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Valider :"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Confirmer que ce livre est conforme aux standards EPUB"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Pages simples"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Doubles-pages"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Enregistrer"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "TAILLE DE LA POLICE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGES"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "COULEUR DU TEXTE ET DU FOND"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Noir et Blanc"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Mille et une Nuits"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Sables de Dune"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Le Blues de Ballard"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Le Brouillard de Vancouver"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "FORMAT D\'AFFICHAGE"\r\n  },\r\n  "i18n_scroll_mode" : {\r\n    "message" : "MODE DE DÉFILEMENT"\r\n  },\r\n  "i18n_scroll_mode_auto" : {\r\n    "message" : "Auto"\r\n  },\r\n  "i18n_scroll_mode_doc" : {\r\n    "message" : "Document"\r\n  },\r\n  "i18n_scroll_mode_continuous" : {\r\n    "message" : "Continu"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium pour Chrome est l\'extension du navigateur Chrome de ReadiumJS, un système de lecture open-source et une librairie JavaScript pour afficher des documents EPUB® dans les navigateurs web. ReadiumJS est un projet de la fondation Readium (Readium.org). Pour en savoir plus ou pour contribuer, visiter la <a href=\\"http://readium.org/projects/readiumjs\\">page d\'accueil du projet</a>."\r\n  },\r\n  "i18n_audio_play" : {\r\n    "message" : "Jouer"\r\n  },\r\n  "i18n_audio_pause" : {\r\n    "message" : "Pauser"\r\n  },\r\n  "i18n_audio_previous" : {\r\n    "message" : "Phrase audio précédente"\r\n  },\r\n  "i18n_audio_next" : {\r\n    "message" : "Phrase audio suivante"\r\n  },\r\n  "i18n_audio_volume" : {\r\n    "message" : "Ajustement du volume audio"\r\n  },\r\n  "i18n_audio_time" : {\r\n    "message" : "Contrôle du curseur temporel audio"\r\n  },\r\n  "i18n_audio_mute" : {\r\n    "message" : "Silence audio"\r\n  },\r\n  "i18n_audio_unmute" : {\r\n    "message" : "Restaurer le volume audio"\r\n  },\r\n  "i18n_audio_expand" : {\r\n    "message" : "Afficher les contrôles audio avancés"\r\n  },\r\n  "i18n_audio_collapse" : {\r\n    "message" : "Fermer les contrôles audio avancés"\r\n  },\r\n  "i18n_audio_esc" : {\r\n    "message" : "Échapper le contexte audio actuel"\r\n  },\r\n  "i18n_audio_rate" : {\r\n    "message" : "Vitesse de lecture audio"\r\n  },\r\n  "i18n_audio_rate_reset" : {\r\n    "message" : "Retour à la vitesse normale de lecture audio"\r\n  },\r\n  "i18n_audio_skip_disable" : {\r\n    "message" : "Désactiver la \'skippabilité\'"\r\n  },\r\n  "i18n_audio_skip_enable" : {\r\n    "message" : "Activer la \'skippabilité\'"\r\n  },\r\n  "i18n_audio_touch_enable" : {\r\n    "message" : "Activer la fonction \'toucher pour jouer\'"\r\n  },\r\n  "i18n_audio_touch_disable" : {\r\n    "message" : "Désactiver la fonction \'toucher pour jouer\'"\r\n  },\r\n  "i18n_audio_highlight_default" : {\r\n    "message" : "défaut"\r\n  },\r\n  "i18n_audio_highlight" : {\r\n    "message" : "Couleur audio"\r\n  },\r\n  "i18n_audio_sync" : {\r\n    "message" : "Granularité de synchronisation texte / audio"\r\n  },\r\n  "i18n_audio_sync_default" : {\r\n    "message" : "Défaut"\r\n  },\r\n  "i18n_audio_sync_word" : {\r\n    "message" : "Mot"\r\n  },\r\n  "i18n_audio_sync_sentence" : {\r\n    "message" : "Phrase"\r\n  },\r\n  "i18n_audio_sync_paragraph" : {\r\n    "message" : "Paragraphe"\r\n  },\r\n  "i18n_page_previous" : {\r\n    "message" : "Page précédente"\r\n  },\r\n  "i18n_page_next" : {\r\n    "message" : "Page suivante"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,fr,ja,de"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!i18n/_locales/id/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "reader untuk buku-buku EPUB3 ."\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Perpustakaan Readium"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Pilihan Readium :"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Simpan perubahan"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Tutup"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Paginate all reflowable ePUB content"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Secara otomatis buka *.epub urls di readium"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Tampilkan pesan peringatan ketika unpacking file EPUB"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Detail"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Baca"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Hapus"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Penulis: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Penerbit: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Sumber: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Tgl Terbit: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Tgl Modifikasi: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "Versi EPUB: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Dibuat di: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Format: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Menambahkan: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Tidak dikenal"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Maaf, EPUB saat ini tidak berisi overlay media untuk konten ini "\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Masukkan item r Library disini!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "extracting: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Apakah and yakin ingin menghapus secara permanen "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Masukkan Buku ke Readium Library:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Add Book"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Batal"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "Dari Web:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "Dari File local:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Masukkan  URL ke file .epub "\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Unpacked Directory:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Validasi:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Konfirmasikan bahwa buku ini sesuai dengan standar EPUB"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Single Pages"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Double Pages"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Save Settings"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "FONT SIZE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGINS"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "TEKS DAN WARNA LATAR"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Black and White"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Arabian Nights"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Sands of Dune"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Ballard Blues"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Vancouver Mist"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "DISPLAY FORMAT"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>, a project of the International Digital Publishing Forum (IDPF) and supporters, adalah sistem referensi open source DAN rendering engine untuk EPUB&reg; publikasi.  Untuk mengetahui lebih lanjut, kunjungi <a href=\\"http://readium.org/\\">project homepage</a>. Sampai saat ini, pengembangan project telah dipimpin oleh  <a href=\\"http://evidentpoint.com/\\">Evident Point</a> and <a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>. Untuk kontribusi, kunjungi <a href=\\"https://github.com/readium/readium-js-viewer\\">github repository</a>"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!i18n/_locales/it/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "Un visualizzatore di documenti EPUB3"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Biblioteca di Readium"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Caricamento biblioteca"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Opzioni di Readium"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Applica"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Chiudi"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Impagina anche i file EPUB reflowable"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Apri in Readium gli URL che terminano in .epub"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Mostra errori e avvisi relativi ai file EPUB"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Dettagli"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Leggi"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Elimina"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Autore: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Editore: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Origine: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Data pubblicazione: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Data ultima modifica: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "Versione EPUB: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Data importazione: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Formato: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Aggiunto: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Sconosciuto"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Spiacente, non ci sono risorse Media Overlays associate a questo elemento."\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Aggiungi libri alla tua biblioteca!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "Decomprimendo: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Sei sicuro di voler cancellare definitivamente "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Aggiungi libro alla Biblioteca di Readium"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Aggiungi libro"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Annulla"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "Scarica dal Web:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "Importa file EPUB dal tuo computer:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Indirizzo Web del file EPUB che vuoi aggiungere:"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Importa directory decompressa:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Convalida:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Controlla che i file siano conformi allo standard EPUB prima di aprirli"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Singole"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Affiancate"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Applica"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "DIMENSIONE CARATTERE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGINI"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "COMBINAZIONE COLORE TESTO/SFONDO"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Bianco su nero"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Notturno"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Deserto"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Mediterraneo"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Nebbia"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "VISUALIZZAZIONE PAGINE"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>, progetto dell\'International Digital Publishing Forum (IDPF) e dei suoi sostenitori, è una piattaforma open source di lettura e un motore di rendering per documenti in formato EPUB&reg;. Per saperne di più, visita la <a href=\\"http://readium.org/\\">pagina principale del progetto</a>. Lo sviluppo del progetto è stato guidato da <a href=\\"http://evidentpoint.com/\\">Evident Point</a> e <a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>. Per contribuire, visita il <a href=\\"https://github.com/readium/readium-js-viewer\\">repository github</a>."\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accetta le seguenti lingue: $languages$",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,it,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!i18n/_locales/ja/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "EPUB3ブックリーダ"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readiumライブラリ"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readiumオプション:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "変更を保存"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "閉じる"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "リフロー可能なEPUBコンテンツをすべてページネートする"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "URLが*.epubなら自動でReadiumで開く"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "EPUBファイルを展開する際には警告メッセージを表示する"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "詳細"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "読む"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "削除"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "著者: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "出版社: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "ソース: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "出版日時: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "更新日時: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUBバージョン: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "追加日時: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "フォーマット: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "追加日時: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "不明"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "現在のEPUBにはこのコンテンツのメディアオーバーレイが含まれていません"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "ここをクリックして本を登録します!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "展開しています: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "本を削除します: "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Readiumライブラリに本を追加します:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "本の追加"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "キャンセル"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "Webから:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "ローカルファイルから:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : ".epubファイルのURLを入力してください"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "パッケージ化されていないフォルダ:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "検証（バリデート）:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "この本がEPUB仕様に準拠していることを確認する"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "単ページ"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "ダブル"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "設定を保存する"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "文字サイズ"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "マージン"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "文字色と背景色"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "白背景に黒文字"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "アラビアンナイト"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "砂丘の砂"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "バラード ブルース"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "バンクーバーの霧"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "表示形式"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>とは, International Digital Publishing Forum (IDPF) と支援企業によるプロジェクトで, EPUB&reg; 出版のためのシステムとレンダリングエンジンのオープンソースリファレンスです。詳しくは、<a href=\\"http://readium.org/\\">プロジェクトホームページ</a>をご覧ください。これまでは<a href=\\"http://evidentpoint.com/\\">Evident Point</a>と<a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>がプロジェクト開発をリードしてきました。 コントリビュートするには<a href=\\"https://github.com/readium/readium-js-viewer\\">githubレポジトリ</a>をご覧ください。"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!i18n/_locales/ko/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "EPUB3책 리더."\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readium 라이브러리"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readium 옵션:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "변경사항 저장"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "닫기"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "모든 리플로우 컨텐츠의 페이지네이션"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "*.epub url들을 radium에서 자동으로 열기"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "EPUB파일들을 열 때 경고메시지 표시"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "세부항목"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "읽기"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "삭제"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "저자: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "출판사: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "소스: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "출판일: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "개정일: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUB 버전: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "생성: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "포맷: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "추가일시: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "미상"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "현재 EPUB은 이 컨텐츠를 위한 미디어 오버레이가 포함되어 있지 않습니다."\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "책을 등록하기 위하여 여기를 클릭하세요!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "정보 추출 중: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "영구히 삭제하시길 원하십니까? "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Readium 라이브러리에 책 추가:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "책 추가"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "취소"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "웹에서:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "로컬 파일에서:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : ".epub 파일의 URL을 입력하세요"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "추출된 디렉토리:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "승인:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "이 책이 ePUB표준을 따르는지 확인"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "단일 페이지"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "더블 페이지"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "설정 저장"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "폰트 크기"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "여백"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "글자와 배경 색"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "흑백"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "아라비안 나이트"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "샌즈 오브 듄"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "발라드 블루스"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "밴쿠버 안개"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "디스플레이 포맷"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>는 EPUB&reg;컨텐츠의 출판을 위한 국제디지털출판포럼(IDPF, International Digital Publishing Forum)과 지원 기업들의 오픈소스 시스템 및 렌더링 엔진 프로젝트입니다. 자세한 내용은 <a href=\\"http://readium.org/\\">프로젝트 홈페이지</a>를 참조하세요. 지금까지, 프로젝트 개발은 <a href=\\"http://evidentpoint.com/\\">Evident Point</a>와 <a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>에 의해서 주도 되었습니다. 프로젝트에 기여하시기 위해서는 <a href=\\"https://github.com/readium/readium-js-viewer\\">github 저장소</a>를 확인하시기 바랍니다."\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n\r\n';});


define('text!i18n/_locales/pt_BR/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description" : {\r\n    "message": "Um leitor para livros para EPUB3."\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Biblioteca Readium"\r\n  },\r\n  "i18n_loading" : {\r\n   "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Opções do Readium:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Salvar mudanças"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Fechar"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Paginar todo o conteúdo ePUB fluído"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Abrir automaticamente urls *.epub no readium"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Exibir mensagem de alerta quando extraindo arquivos EPUB"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Detalhes"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Ler"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Excluir"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Autor: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Editora: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Origem: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Publicação: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Data de Modificação: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "Versão do EPUB: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Criado aos: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Formato: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Adicionado: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Desconhecido"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Desculpe, o atual EPUB não contém uma mídia de sobreposição para este conteúdo"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Adicione itens para sua biblioteca aqui!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "extraindo: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Você tem certeza de que deseja excluir permanentemente "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Adicionar Livro à Biblioteca Readium:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Adicionar Livro"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Cancelar"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "Da Rede:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "De Arquivo Local:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Insira uma URL para um arquivo .epub"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Diretório Extraido:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Validar:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Confirmar que este livro obedece aos padrões ePUB"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Pág. Simples"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Pág. Duplas"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Salvar Configurações"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "TAMANHO DA FONTE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGENS"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "COR DO TEXTO E PLANO DE FUNDO"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Preto e Branco"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Noites Árabes"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Areias de Duna"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Ballard Blues"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Névoa de Vancouver"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "FORMATO DE EXIBIÇÃO"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>, a project of the International Digital Publishing Forum (IDPF) and supporters, is an open source reference system and rendering engine for EPUB&reg; publications.  To learn more, visit the <a href=\\"http://readium.org/\\">project homepage</a>. To date, the project development has been lead by <a href=\\"http://evidentpoint.com/\\">Evident Point</a> and <a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>. To contribute visit the <a href=\\"https://github.com/readium/readium-js-viewer\\">github repository</a>"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,pt-BR,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!i18n/_locales/zh_CN/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "EPUB3电子书阅览器"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readium书库"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readium选项:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "保存更改"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "关闭"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "分页显示所有可重排版EPUB文件"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "自动用Readium打开*.epub网址"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "解压缩EPUB文件时显示警告消息"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "详细信息"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "阅读"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "删除"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "作者: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "出版社: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "源自: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "出版日期: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "更新日期: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUB版本: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "创建日期: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "格式: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "添加: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "未知"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "目前EPUB不支持此内容的媒体格式"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "点击这里添加新书"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "解压中: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "确定永久删除 "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "添加新书到Readium书库:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "添加"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "取消"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "从网络:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "从本地文件:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "请输入一个.EPUB文件的URL"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "未打包目录:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "验证:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "确认这本书是否符合EPUB标准"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "单页"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "双页"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "保存设置"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "字体大小"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "页边距"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "字体和背景颜色"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Black and White"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Arabian Nights"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Sands of Dune"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Ballard Blues"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Vancouver Mist"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "显示格式"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>，是一个International Digital Publishing Forum (IDPF)和技术支持者们共同开发的项目，也是一个开放源代码的EPUB格式出版物的渲染引擎。要了解更多信息，请访问<a href=\\"http://readium.org/\\">项目主页</a>。迄今为止，该项目的开发一直由<a href=\\"http://evidentpoint.com/\\">Evident Point</a>和<a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>来领导。要贡献请访问<a href=\\"https://github.com/readium/readium-js-viewer\\">GitHub资料库</a>"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!i18n/_locales/zh_TW/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "EPUB3電子書閱讀器"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readium書櫃"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readium設定:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "儲存變更"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "關閉"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "分頁呈現所有文字順走型的EPUB內容"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "自動以Readium開啟任何以.epub結尾的網址"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "解壓縮EPUB檔案時顯示警告訊息"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "詳細"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "閱讀"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "刪除"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "作者："\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "出版社："\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "來源："\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "出版日期："\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "更新日期："\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID："\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUB版本："\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "建立日期："\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "格式："\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "加入日期："\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "未知"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "目前的EPUB內容並不包含朗讀聲音"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "按下這裡加入新書"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "解壓縮中："\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "你確定要永久刪除 "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "將書籍加入Readium書櫃："\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "加入書籍"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "取消"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "從網站加入："\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "從檔案加入："\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "請輸入 .epub 檔案所在網址"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "未壓縮目錄："\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "檢證："\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "確認這本書是否符合EPUB標準"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "單頁呈現"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "跨頁呈現"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "儲存設定"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "文字尺寸"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "頁緣餘白"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "文字與背景色彩"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "黑底與白字"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "阿拉伯之夜"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "砂丘之黃砂"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "抒情曲藍調"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "溫哥華之霧"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "顯示格式"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>是由是International Digital Publishing Forum (IDPF)與技術協助者們共同開發的專案，是供EPUB&reg; 出版品使用的開放原始碼參考系統與排版引擎。要了解更多訊息，請前往<a href=\\"http://readium.org/\\">專案網頁</a>。迄今為止，本專案持續由<a href=\\"http://evidentpoint.com/\\">Evident Point</a>和<a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>所主導。若想協助開發，請前往<a href=\\"https://github.com/readium/readium-js-viewer\\">GitHub專案</a>"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,zh-TW,zh-HK,ja,sr,de"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('i18n/Strings',['text!i18n/_locales/de/messages.json',
        'text!i18n/_locales/es/messages.json',
		'text!i18n/_locales/en_US/messages.json', 
		'text!i18n/_locales/fr/messages.json', 
		'text!i18n/_locales/id/messages.json', 
		'text!i18n/_locales/it/messages.json', 
		'text!i18n/_locales/ja/messages.json',
		'text!i18n/_locales/ko/messages.json',
		'text!i18n/_locales/pt_BR/messages.json',
		'text!i18n/_locales/zh_CN/messages.json',
		'text!i18n/_locales/zh_TW/messages.json'], 
function(de, es, en_US, fr, id, it, ja, ko, pt_BR, zh_CN, zh_TW){
	var Strings = {};

	Strings['de'] = de;
	Strings['es'] = es;
	Strings['en_US'] = en_US;
	Strings['fr'] = fr;
	Strings['id'] = id;
	Strings['it'] = it;
	Strings['ja'] = ja;
	Strings['ko'] = ko;
	Strings['pt_BR'] = pt_BR;
	Strings['zh_CN'] = zh_CN;
	Strings['zh_TW'] = zh_TW;

	var language = navigator.userLanguage || navigator.language;
//FORCE HERE (for testing)
//language="es";
    console.log("Language: [" + language + "]");
    
    var allowEnglishFallback = true;
    
	var i18nStr = Strings[language] || en_US;

	var i18nObj = JSON.parse(i18nStr);
    var i18nObj_en = i18nStr === en_US ? i18nObj : JSON.parse(en_US);

	for(var prop in i18nObj_en){
        var okay = prop in i18nObj;
        if (!okay) console.log("Language [" + language + "], missing string: [" + prop + "]");
        
		i18nObj[prop] = okay ? i18nObj[prop].message : (allowEnglishFallback ? ("*"+i18nObj_en[prop].message) : "");
	}
	return i18nObj;

});
/*!
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */



var Hogan = {};

(function (Hogan) {
  Hogan.Template = function (codeObj, text, compiler, options) {
    codeObj = codeObj || {};
    this.r = codeObj.code || this.r;
    this.c = compiler;
    this.options = options || {};
    this.text = text || '';
    this.partials = codeObj.partials || {};
    this.subs = codeObj.subs || {};
    this.buf = '';
  }

  Hogan.Template.prototype = {
    // render: replaced by generated code.
    r: function (context, partials, indent) { return ''; },

    // variable escaping
    v: hoganEscape,

    // triple stache
    t: coerceToString,

    render: function render(context, partials, indent) {
      return this.ri([context], partials || {}, indent);
    },

    // render internal -- a hook for overrides that catches partials too
    ri: function (context, partials, indent) {
      return this.r(context, partials, indent);
    },

    // ensurePartial
    ep: function(symbol, partials) {
      var partial = this.partials[symbol];

      // check to see that if we've instantiated this partial before
      var template = partials[partial.name];
      if (partial.instance && partial.base == template) {
        return partial.instance;
      }

      if (typeof template == 'string') {
        if (!this.c) {
          throw new Error("No compiler available.");
        }
        template = this.c.compile(template, this.options);
      }

      if (!template) {
        return null;
      }

      // We use this to check whether the partials dictionary has changed
      this.partials[symbol].base = template;

      if (partial.subs) {
        // Make sure we consider parent template now
        if (!partials.stackText) partials.stackText = {};
        for (key in partial.subs) {
          if (!partials.stackText[key]) {
            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
          }
        }
        template = createSpecializedPartial(template, partial.subs, partial.partials,
          this.stackSubs, this.stackPartials, partials.stackText);
      }
      this.partials[symbol].instance = template;

      return template;
    },

    // tries to find a partial in the current scope and render it
    rp: function(symbol, context, partials, indent) {
      var partial = this.ep(symbol, partials);
      if (!partial) {
        return '';
      }

      return partial.ri(context, partials, indent);
    },

    // render a section
    rs: function(context, partials, section) {
      var tail = context[context.length - 1];

      if (!isArray(tail)) {
        section(context, partials, this);
        return;
      }

      for (var i = 0; i < tail.length; i++) {
        context.push(tail[i]);
        section(context, partials, this);
        context.pop();
      }
    },

    // maybe start a section
    s: function(val, ctx, partials, inverted, start, end, tags) {
      var pass;

      if (isArray(val) && val.length === 0) {
        return false;
      }

      if (typeof val == 'function') {
        val = this.ms(val, ctx, partials, inverted, start, end, tags);
      }

      pass = !!val;

      if (!inverted && pass && ctx) {
        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
      }

      return pass;
    },

    // find values with dotted names
    d: function(key, ctx, partials, returnFound) {
      var found,
          names = key.split('.'),
          val = this.f(names[0], ctx, partials, returnFound),
          doModelGet = this.options.modelGet,
          cx = null;

      if (key === '.' && isArray(ctx[ctx.length - 2])) {
        val = ctx[ctx.length - 1];
      } else {
        for (var i = 1; i < names.length; i++) {
          found = findInScope(names[i], val, doModelGet);
          if (found !== undefined) {
            cx = val;
            val = found;
          } else {
            val = '';
          }
        }
      }

      if (returnFound && !val) {
        return false;
      }

      if (!returnFound && typeof val == 'function') {
        ctx.push(cx);
        val = this.mv(val, ctx, partials);
        ctx.pop();
      }

      return val;
    },

    // find values with normal names
    f: function(key, ctx, partials, returnFound) {
      var val = false,
          v = null,
          found = false,
          doModelGet = this.options.modelGet;

      for (var i = ctx.length - 1; i >= 0; i--) {
        v = ctx[i];
        val = findInScope(key, v, doModelGet);
        if (val !== undefined) {
          found = true;
          break;
        }
      }

      if (!found) {
        return (returnFound) ? false : "";
      }

      if (!returnFound && typeof val == 'function') {
        val = this.mv(val, ctx, partials);
      }

      return val;
    },

    // higher order templates
    ls: function(func, cx, partials, text, tags) {
      var oldTags = this.options.delimiters;

      this.options.delimiters = tags;
      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
      this.options.delimiters = oldTags;

      return false;
    },

    // compile text
    ct: function(text, cx, partials) {
      if (this.options.disableLambda) {
        throw new Error('Lambda features disabled.');
      }
      return this.c.compile(text, this.options).render(cx, partials);
    },

    // template result buffering
    b: function(s) { this.buf += s; },

    fl: function() { var r = this.buf; this.buf = ''; return r; },

    // method replace section
    ms: function(func, ctx, partials, inverted, start, end, tags) {
      var textSource,
          cx = ctx[ctx.length - 1],
          result = func.call(cx);

      if (typeof result == 'function') {
        if (inverted) {
          return true;
        } else {
          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
        }
      }

      return result;
    },

    // method replace variable
    mv: function(func, ctx, partials) {
      var cx = ctx[ctx.length - 1];
      var result = func.call(cx);

      if (typeof result == 'function') {
        return this.ct(coerceToString(result.call(cx)), cx, partials);
      }

      return result;
    },

    sub: function(name, context, partials, indent) {
      var f = this.subs[name];
      if (f) {
        this.activeSub = name;
        f(context, partials, this, indent);
        this.activeSub = false;
      }
    }

  };

  //Find a key in an object
  function findInScope(key, scope, doModelGet) {
    var val;

    if (scope && typeof scope == 'object') {

      if (scope[key] !== undefined) {
        val = scope[key];

      // try lookup with get for backbone or similar model data
      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
        val = scope.get(key);
      }
    }

    return val;
  }

  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
    function PartialTemplate() {};
    PartialTemplate.prototype = instance;
    function Substitutions() {};
    Substitutions.prototype = instance.subs;
    var key;
    var partial = new PartialTemplate();
    partial.subs = new Substitutions();
    partial.subsText = {};  //hehe. substext.
    partial.buf = '';

    stackSubs = stackSubs || {};
    partial.stackSubs = stackSubs;
    partial.subsText = stackText;
    for (key in subs) {
      if (!stackSubs[key]) stackSubs[key] = subs[key];
    }
    for (key in stackSubs) {
      partial.subs[key] = stackSubs[key];
    }

    stackPartials = stackPartials || {};
    partial.stackPartials = stackPartials;
    for (key in partials) {
      if (!stackPartials[key]) stackPartials[key] = partials[key];
    }
    for (key in stackPartials) {
      partial.partials[key] = stackPartials[key];
    }

    return partial;
  }

  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos = /\'/g,
      rQuot = /\"/g,
      hChars = /[&<>\"\']/;

  function coerceToString(val) {
    return String((val === null || val === undefined) ? '' : val);
  }

  function hoganEscape(str) {
    str = coerceToString(str);
    return hChars.test(str) ?
      str
        .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }

  var isArray = Array.isArray || function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };

})(typeof exports !== 'undefined' ? exports : Hogan);



(function (Hogan) {
  // Setup regex  assignments
  // remove whitespace according to Mustache spec
  var rIsWhitespace = /\S/,
      rQuot = /\"/g,
      rNewline =  /\n/g,
      rCr = /\r/g,
      rSlash = /\\/g,
      rLineSep = /\u2028/,
      rParagraphSep = /\u2029/;

  Hogan.tags = {
    '#': 1, '^': 2, '<': 3, '$': 4,
    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
    '{': 10, '&': 11, '_t': 12
  };

  Hogan.scan = function scan(text, delimiters) {
    var len = text.length,
        IN_TEXT = 0,
        IN_TAG_TYPE = 1,
        IN_TAG = 2,
        state = IN_TEXT,
        tagType = null,
        tag = null,
        buf = '',
        tokens = [],
        seenTag = false,
        i = 0,
        lineStart = 0,
        otag = '{{',
        ctag = '}}';

    function addBuf() {
      if (buf.length > 0) {
        tokens.push({tag: '_t', text: new String(buf)});
        buf = '';
      }
    }

    function lineIsWhitespace() {
      var isAllWhitespace = true;
      for (var j = lineStart; j < tokens.length; j++) {
        isAllWhitespace =
          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
        if (!isAllWhitespace) {
          return false;
        }
      }

      return isAllWhitespace;
    }

    function filterLine(haveSeenTag, noNewLine) {
      addBuf();

      if (haveSeenTag && lineIsWhitespace()) {
        for (var j = lineStart, next; j < tokens.length; j++) {
          if (tokens[j].text) {
            if ((next = tokens[j+1]) && next.tag == '>') {
              // set indent to token value
              next.indent = tokens[j].text.toString()
            }
            tokens.splice(j, 1);
          }
        }
      } else if (!noNewLine) {
        tokens.push({tag:'\n'});
      }

      seenTag = false;
      lineStart = tokens.length;
    }

    function changeDelimiters(text, index) {
      var close = '=' + ctag,
          closeIndex = text.indexOf(close, index),
          delimiters = trim(
            text.substring(text.indexOf('=', index) + 1, closeIndex)
          ).split(' ');

      otag = delimiters[0];
      ctag = delimiters[delimiters.length - 1];

      return closeIndex + close.length - 1;
    }

    if (delimiters) {
      delimiters = delimiters.split(' ');
      otag = delimiters[0];
      ctag = delimiters[1];
    }

    for (i = 0; i < len; i++) {
      if (state == IN_TEXT) {
        if (tagChange(otag, text, i)) {
          --i;
          addBuf();
          state = IN_TAG_TYPE;
        } else {
          if (text.charAt(i) == '\n') {
            filterLine(seenTag);
          } else {
            buf += text.charAt(i);
          }
        }
      } else if (state == IN_TAG_TYPE) {
        i += otag.length - 1;
        tag = Hogan.tags[text.charAt(i + 1)];
        tagType = tag ? text.charAt(i + 1) : '_v';
        if (tagType == '=') {
          i = changeDelimiters(text, i);
          state = IN_TEXT;
        } else {
          if (tag) {
            i++;
          }
          state = IN_TAG;
        }
        seenTag = i;
      } else {
        if (tagChange(ctag, text, i)) {
          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
          buf = '';
          i += ctag.length - 1;
          state = IN_TEXT;
          if (tagType == '{') {
            if (ctag == '}}') {
              i++;
            } else {
              cleanTripleStache(tokens[tokens.length - 1]);
            }
          }
        } else {
          buf += text.charAt(i);
        }
      }
    }

    filterLine(seenTag, true);

    return tokens;
  }

  function cleanTripleStache(token) {
    if (token.n.substr(token.n.length - 1) === '}') {
      token.n = token.n.substring(0, token.n.length - 1);
    }
  }

  function trim(s) {
    if (s.trim) {
      return s.trim();
    }

    return s.replace(/^\s*|\s*$/g, '');
  }

  function tagChange(tag, text, index) {
    if (text.charAt(index) != tag.charAt(0)) {
      return false;
    }

    for (var i = 1, l = tag.length; i < l; i++) {
      if (text.charAt(index + i) != tag.charAt(i)) {
        return false;
      }
    }

    return true;
  }

  // the tags allowed inside super templates
  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

  function buildTree(tokens, kind, stack, customTags) {
    var instructions = [],
        opener = null,
        tail = null,
        token = null;

    tail = stack[stack.length - 1];

    while (tokens.length > 0) {
      token = tokens.shift();

      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
        throw new Error('Illegal content in < super tag.');
      }

      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
        stack.push(token);
        token.nodes = buildTree(tokens, token.tag, stack, customTags);
      } else if (token.tag == '/') {
        if (stack.length === 0) {
          throw new Error('Closing tag without opener: /' + token.n);
        }
        opener = stack.pop();
        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
        }
        opener.end = token.i;
        return instructions;
      } else if (token.tag == '\n') {
        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
      }

      instructions.push(token);
    }

    if (stack.length > 0) {
      throw new Error('missing closing tag: ' + stack.pop().n);
    }

    return instructions;
  }

  function isOpener(token, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].o == token.n) {
        token.tag = '#';
        return true;
      }
    }
  }

  function isCloser(close, open, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].c == close && tags[i].o == open) {
        return true;
      }
    }
  }

  function stringifySubstitutions(obj) {
    var items = [];
    for (var key in obj) {
      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
    }
    return "{ " + items.join(",") + " }";
  }

  function stringifyPartials(codeObj) {
    var partials = [];
    for (var key in codeObj.partials) {
      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
    }
    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
  }

  Hogan.stringify = function(codeObj, text, options) {
    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
  }

  var serialNo = 0;
  Hogan.generate = function(tree, text, options) {
    serialNo = 0;
    var context = { code: '', subs: {}, partials: {} };
    Hogan.walk(tree, context);

    if (options.asString) {
      return this.stringify(context, text, options);
    }

    return this.makeTemplate(context, text, options);
  }

  Hogan.wrapMain = function(code) {
    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
  }

  Hogan.template = Hogan.Template;

  Hogan.makeTemplate = function(codeObj, text, options) {
    var template = this.makePartials(codeObj);
    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
    return new this.template(template, text, this, options);
  }

  Hogan.makePartials = function(codeObj) {
    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
    for (key in template.partials) {
      template.partials[key] = this.makePartials(template.partials[key]);
    }
    for (key in codeObj.subs) {
      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
    }
    return template;
  }

  function esc(s) {
    return s.replace(rSlash, '\\\\')
            .replace(rQuot, '\\\"')
            .replace(rNewline, '\\n')
            .replace(rCr, '\\r')
            .replace(rLineSep, '\\u2028')
            .replace(rParagraphSep, '\\u2029');
  }

  function chooseMethod(s) {
    return (~s.indexOf('.')) ? 'd' : 'f';
  }

  function createPartial(node, context) {
    var prefix = "<" + (context.prefix || "");
    var sym = prefix + node.n + serialNo++;
    context.partials[sym] = {name: node.n, partials: {}};
    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
    return sym;
  }

  Hogan.codegen = {
    '#': function(node, context) {
      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
                      't.rs(c,p,' + 'function(c,p,t){';
      Hogan.walk(node.nodes, context);
      context.code += '});c.pop();}';
    },

    '^': function(node, context) {
      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
      Hogan.walk(node.nodes, context);
      context.code += '};';
    },

    '>': createPartial,
    '<': function(node, context) {
      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
      Hogan.walk(node.nodes, ctx);
      var template = context.partials[createPartial(node, context)];
      template.subs = ctx.subs;
      template.partials = ctx.partials;
    },

    '$': function(node, context) {
      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
      Hogan.walk(node.nodes, ctx);
      context.subs[node.n] = ctx.code;
      if (!context.inPartial) {
        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
      }
    },

    '\n': function(node, context) {
      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
    },

    '_v': function(node, context) {
      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
    },

    '_t': function(node, context) {
      context.code += write('"' + esc(node.text) + '"');
    },

    '{': tripleStache,

    '&': tripleStache
  }

  function tripleStache(node, context) {
    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
  }

  function write(s) {
    return 't.b(' + s + ');';
  }

  Hogan.walk = function(nodelist, context) {
    var func;
    for (var i = 0, l = nodelist.length; i < l; i++) {
      func = Hogan.codegen[nodelist[i].tag];
      func && func(nodelist[i], context);
    }
    return context;
  }

  Hogan.parse = function(tokens, text, options) {
    options = options || {};
    return buildTree(tokens, '', [], options.sectionTags || []);
  }

  Hogan.cache = {};

  Hogan.cacheKey = function(text, options) {
    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
  }

  Hogan.compile = function(text, options) {
    options = options || {};
    var key = Hogan.cacheKey(text, options);
    var template = this.cache[key];

    if (template) {
      var partials = template.partials;
      for (var name in partials) {
        delete partials[name].instance;
      }
      return template;
    }

    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
    return this.cache[key] = template;
  }
})(typeof exports !== 'undefined' ? exports : Hogan);


if (typeof define === 'function' && define.amd) {
  define('hogan',Hogan);
}
;
/**@license
 * RequireJS Hogan Plugin | v0.3.0 (2013/06/11)
 * Author: Miller Medeiros | MIT License
 */
define('hgn',['hogan', 'text'], function (hogan, text) {

    var DEFAULT_EXTENSION = '.mustache';

    var _buildMap = {};
    var _buildTemplateText = 'define("{{pluginName}}!{{moduleName}}", ["hogan"], function(hogan){'+
                             '  var tmpl = new hogan.Template({{{fn}}}, "", hogan);'+
                             // need to use apply to bind the proper scope.
                             '  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;'+
                             '});\n';
    var _buildTemplate;


    function load(name, req, onLoad, config){
        var hgnConfig = config.hgn || {};
        var fileName = name;
        fileName += hgnConfig && hgnConfig.templateExtension != null? hgnConfig.templateExtension : DEFAULT_EXTENSION;

        // load text files with text plugin
        text.get(req.toUrl(fileName), function(data){
            var compilationOptions = hgnConfig.compilationOptions? mixIn({}, hgnConfig.compilationOptions) : {};

            if (config.isBuild) {
                // store compiled function if build
                // and should always be a string
                compilationOptions.asString = true;
                _buildMap[name] = hogan.compile(data, compilationOptions);
            }

            // maybe it's required by some other plugin during build
            // so return the compiled template even during build
            var template = hogan.compile(data, compilationOptions);
            var render = bind(template.render, template);
            // add text property for debugging if needed.
            // it's important to notice that this value won't be available
            // after build.
            render.text = template.text;
            render.template = template;
            // return just the render method so it's easier to use
            onLoad( render );
        });
    }

    function bind(fn, context) {
        return function(){
            return fn.apply(context, arguments);
        };
    }

    function mixIn(target, source) {
        var key;
        for (key in source){
            if ( Object.prototype.hasOwnProperty.call(source, key) ) {
                target[key] = source[key];
            }
        }
        return target;
    }

    function write(pluginName, moduleName, writeModule){
        if(moduleName in _buildMap){
            if (! _buildTemplate) {
                // using templates to generate compiled templates, so meta :P
                _buildTemplate = hogan.compile( _buildTemplateText );
            }
            var fn = _buildMap[moduleName];
            writeModule( _buildTemplate.render({
                pluginName : pluginName,
                moduleName : moduleName,
                fn : fn
            }) );
        }
    }

    return {
        load : load,
        write : write
    };

});


define("hgn!templates/managed-dialog.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"modal fade\" id=\"managed-dialog\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"managed-label\">\r");t.b("\n" + i);t.b("    <div class=\"modal-dialog\">\r");t.b("\n" + i);t.b("        <div class=\"modal-content\">\r");t.b("\n" + i);t.b("            <div class=\"modal-header\">\r");t.b("\n" + i);t.b("                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"close\" title=\"close\"><span aria-hidden=\"true\">&times;<span></button>\r");t.b("\n" + i);t.b("                <h4 class=\"modal-title\" id=\"managed-label\"></h4>\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("            <div class=\"modal-body\">\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("            <div class=\"modal-footer\">\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("        </div>\r");t.b("\n" + i);t.b("        <!-- /.modal-content --> \r");t.b("\n" + i);t.b("    </div><!-- /.modal-dialog -->\r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("<!-- /.modal -->");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!templates/progress-dialog.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"progress progress-striped active\">\r");t.b("\n" + i);t.b("  <div class=\"progress-bar\"  role=\"progressbar\" aria-valuenow=\"1\" aria-valuemin=\"1\" aria-valuemax=\"100\" style=\"width: 1%\">\r");t.b("\n" + i);t.b("    <!-- <span class=\"progress-message sr-only\">");t.b(t.v(t.f("message",c,p,0)));t.b("</span> -->\r");t.b("\n" + i);t.b("  </div>\r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("<div class=\"progress-message\">");t.b(t.v(t.f("message",c,p,0)));t.b("</div>\r");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!templates/managed-buttons.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("buttons",c,p,1),c,p,0,12,157,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<button type=\"button\" class=\"btn btn-default ");if(t.s(t.f("classes",c,p,1),c,p,0,71,77,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(t.v(t.d(".",c,p,0)));t.b(" ");});c.pop();}t.b("\" ");if(t.s(t.f("dismiss",c,p,1),c,p,0,103,125,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" data-dismiss=\"modal\" ");});c.pop();}t.b(">");t.b(t.v(t.f("text",c,p,0)));t.b("</button>\r");t.b("\n" + i);});c.pop();}return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});

define('workers/Messages',[],function(){
	return {
		// window -> worker messages
		IMPORT_ZIP : 0,
		OVERWRITE_CONTINUE : 1,
		FIND_PACKAGE_RESPONSE: 2,
		PARSE_PACKAGE_RESPONSE: 3,
		DELETE_EPUB : 4,
		IMPORT_DIR : 5,
		IMPORT_URL: 6,
		MIGRATE: 7,
		OVERWRITE_SIDE_BY_SIDE: 8,
		CONTINUE_IMPORT_ZIP: 9,

		// worker -> window messages
		SUCCESS : 100,
		PROGRESS : 101,
		ERROR : 102,
		OVERWRITE : 103,
		FIND_PACKAGE : 104,
		PARSE_PACKAGE: 105,


		PROGRESS_EXTRACTING : 200,
		PROGRESS_WRITING: 201,
		PROGRESS_DELETING: 202,
		PROGRESS_MIGRATING: 203,

		ERROR_STORAGE : 300,
		ERROR_EPUB : 301,
		ERROR_AJAX : 302,

	}
});
define('Dialogs',['hgn!templates/managed-dialog.html', 'hgn!templates/progress-dialog.html', 'hgn!templates/managed-buttons.html', 'i18n/Strings', 'workers/Messages'], function(ManagedDialog, ProgressDialog, ButtonTemplate, Strings, Messages){
	var $currentModal,
		lastTitle;
	

	var hideExistingModal = function(){
		if($currentModal){
			$currentModal.modal('hide');
		}
	};

	var showModalDialog = function(dismissable, title, body, buttons){
		if (!$currentModal){
			$currentModal = $(ManagedDialog({}));
			$('#app-container').append($currentModal);
			
		}

		$('#managed-label').text(title);
		$('#managed-dialog .modal-body').empty().append(body);
		$('#managed-dialog .modal-footer').empty().append(buttons);
		if (dismissable){
			$('#managed-dialog .close').show();
		}
		else{
			$('#managed-dialog .close').hide();
		}

		if ($currentModal.is(':hidden')){	
			$('#managed-dialog').modal('show');
		}
		
	};
            
	Dialogs = {	
		showError : function(type, data){
			var msg = Strings.err_unknown;
			switch(type){
				case Messages.ERROR_STORAGE:
					msg = Strings.err_storage;
					break;
				case Messages.ERROR_EPUB:
					msg = Strings.err_epub_corrupt;
					break;
				case Messages.ERROR_AJAX:
        				msg = Strings.err_ajax;
                			break;						
				default: 
					msg = Strings.err_unknown;
					console.trace();
					break;
			}
			Dialogs.showModalMessage(Strings.err_dlg_title, msg);
		},
		showModalMessage : function(title, message){
			var body = $('<p></p>').text(message),
				buttons = ButtonTemplate({
					buttons : [
						{
							dismiss : true,
							text : Strings.ok
						}
					]
				});

			showModalDialog(true, title, body, buttons);
		},
		showModalPromptEx : function(title, message, buttons, handlers){

			var body = $('<p></p>').text(message);
			var buttonsStr = ButtonTemplate({buttons: buttons});
			showModalDialog(false, title, body, buttonsStr);

			for (var i = 0; i < handlers.length; i++){
				if (handlers[i]){
					$('#managed-dialog .' + buttons[i].classes[0]).on('click', handlers[i]);
				}
			}
			// if (onOk)
			// 	$('#managed-dialog .yes-button').on('click', onOk);

			// if (onCancel)
			// 	$('#managed-dialog .no-button').on('click', onCancel);
		},
		showModalPrompt : function(title, message, okLabel, cancelLabel, onOk, onCancel){
			
			
			var buttons = [
					{
						dismiss: true,
						text : cancelLabel,
						classes : ['no-button']
					},
					{
						dismiss : true,
						text : okLabel,
						classes : ['yes-button', 'btn-primary']
					}
				];

			handlers = [onCancel, onOk];
			Dialogs.showModalPromptEx(title, message, buttons, handlers);
		},
		showReplaceConfirm : function(title, message, okLabel, cancelLabel, keepBothLabel, onOk, onCancel, onKeepBoth){
			var buttons = [
				
					{
						dismiss: true,
						text : cancelLabel,
						classes : ['no-button']
					},
					{
						dismiss : true,
						text : okLabel,
						classes : ['yes-button', 'btn-danger']
					},
					{
						dismiss : true,
						text : keepBothLabel,
						classes : ['keep-both-button', 'btn-primary']
					}
				
			];
			handlers = [onCancel, onOk, onKeepBoth];
			Dialogs.showModalPromptEx(title, message, buttons, handlers);
		},
		showModalProgress : function(title, message){
			var data = {
				message: message
			}
			lastTitle = title;
			showModalDialog(false, title, ProgressDialog(data), '');
		},
		updateProgress : function(percent, type, data, noForce){
			
			var msg = '';
			switch(type){
				case Messages.PROGRESS_MIGRATING : 
					msg = Strings.migrating + ' ' + data;
					break;
				case Messages.PROGRESS_EXTRACTING: 
					msg = Strings.i18n_extracting + ' ' + data;
					break;
				case Messages.PROGRESS_WRITING: 
					msg = Strings.storing_file + ' ' + data;
					break;
				case Messages.PROGRESS_DELETING:
					msg = Strings.delete_progress_message + ' ' + data;
					break;
			}
			// if (!noForce && $('#managed-dialog').is(':hidden')){
			//  	Dialogs.showModalProgress(lastTitle, msg);
			// }
			$('#managed-dialog .progress-bar').attr('aria-valuenow', percent).css('width', percent + '%');
			$('#managed-dialog .progress-message').text(msg);
		},
		closeModal : function(){
			hideExistingModal();
		},
		reset : function(){
			if ($currentModal){
				$currentModal.remove();
				$currentModal = null;
			}
		}
	};

	return Dialogs;
});


define("hgn!templates/settings-dialog.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div tabindex=\"-1\" class=\"modal fade\" id=\"settings-dialog\" role=\"dialog\" aria-label=\"");t.b(t.v(t.d("strings.settings",c,p,0)));t.b("\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("    <div class=\"modal-dialog\">\r");t.b("\n" + i);t.b("        <div class=\"modal-content\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("           <!-- div class=\"modal-header\">\r");t.b("\n" + i);t.b("            <h4 class=\"modal-title\" id=\"settings-label\">");t.b(t.v(t.d("strings.settings",c,p,0)));t.b("</h4>\r");t.b("\n" + i);t.b("           </div -->\r");t.b("\n" + i);t.b("               \r");t.b("\n" + i);t.b("            <div class=\"modal-body\">\r");t.b("\n" + i);t.b("           <button type=\"button\" class=\"close\" id=\"closeSettingsCross\" data-dismiss=\"modal\" title=\"");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.settings",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.settings",c,p,0)));t.b("\"><span aria-hidden=\"true\">&times;</span></button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("           <ul class=\"nav nav-tabs\" role=\"tablist\" aria-owns=\"tab-butt-style tab-butt-layout tab-butt-keys\">\r");t.b("\n" + i);t.b("             <li class=\"active\" role=\"presentation\"><button id=\"tab-butt-style\"  title=\"");t.b(t.v(t.d("strings.style",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.style",c,p,0)));t.b("\" role='tab' aria-controls=\"tab-style\" data-toggle=\"tab\" data-target=\"#tab-style\">");t.b(t.v(t.d("strings.style",c,p,0)));t.b("</button></li>\r");t.b("\n" + i);t.b("             <li role=\"presentation\"><button id=\"tab-butt-layout\"  title=\"");t.b(t.v(t.d("strings.layout",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.layout",c,p,0)));t.b("\" role='tab' aria-controls=\"tab-layout\" data-toggle=\"tab\" data-target=\"#tab-layout\">");t.b(t.v(t.d("strings.layout",c,p,0)));t.b("</button></li>\r");t.b("\n" + i);t.b("             <li role=\"presentation\"><button id=\"tab-butt-keys\"  title=\"");t.b(t.v(t.d("strings.i18n_keyboard_shortcuts",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_keyboard_shortcuts",c,p,0)));t.b("\" role='tab' aria-controls=\"tab-keyboard\" data-toggle=\"tab\" data-target=\"#tab-keyboard\">");t.b(t.v(t.d("strings.i18n_keyboard_shortcuts",c,p,0)));t.b("</button></li>\r");t.b("\n" + i);t.b("           </ul>\r");t.b("\n" + i);t.b("           \r");t.b("\n" + i);t.b("           \r");t.b("\n" + i);t.b("           <div class=\"tab-content\">\r");t.b("\n" + i);t.b("                <div id=\"tab-style\" class=\"tab-pane active\" role=\"tabpanel\" aria-expanded=\"true\">\r");t.b("\n" + i);t.b("                     \r");t.b("\n" + i);t.b("                <h5 aria-hidden=\"true\">");t.b(t.v(t.d("strings.preview",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                <div  aria-hidden=\"true\" class=\"row\">\r");t.b("\n" + i);t.b("                    <div data-theme=\"default-theme\" class=\"col-xs-10 col-xs-offset-1 preview-text default-theme\">\r");t.b("\n" + i);t.b("                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus neque dui, congue a suscipit non, feugiat eu urna. Cras in felis sed orci aliquam sagittis. \r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("                </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("<!-- button  type=\"button\" title=\"TESTING\" aria-label=\"TESTING\">TESTING DANIEL</button -->\r");t.b("\n" + i);t.b("                \r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-font-size\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_font_size",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                    <div class=\"row\">\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-2 icon-scale-down\">\r");t.b("\n" + i);t.b("                            <img src=\"images/glyphicons_115_text_smaller.png\" alt=\"\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-8\">\r");t.b("\n" + i);t.b("                            <input  type=\"range\" role=\"slider\" aria-labelledby=\"setting-header-font-size\" id=\"font-size-input\" min=\"60\" aria-value-min=\"60\" aria-valuemin=\"60\" step=\"10\" max=\"170\" aria-value-max=\"170\" aria-valuemax=\"170\" value=\"100\" aria-valuenow=\"100\" aria-value-now=\"100\" aria-valuetext=\"1em\" aria-value-text=\"1em\" title=\"");t.b(t.v(t.d("strings.i18n_font_size",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_font_size",c,p,0)));t.b("\" />\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-2\">\r");t.b("\n" + i);t.b("                            <img src=\"images/glyphicons_116_text_bigger.png\" alt=\"\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-color-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_text_and_background_color",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                    <div role=\"group\" aria-labelledby=\"setting-header-color-legend\" id=\"theme-radio-group\" class=\"row\">\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"author-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_author_theme",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_author_theme",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option author-theme clickable\">");t.b(t.v(t.d("strings.i18n_author_theme",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"default-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_black_and_white",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_black_and_white",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option default-theme clickable\">");t.b(t.v(t.d("strings.i18n_black_and_white",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"night-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_arabian_nights",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.NightTheme",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_arabian_nights",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.NightTheme",c,p,0)));t.b("]\" class=\"col-xs-8 col-xs-offset-2 theme-option night-theme clickable\" >");t.b(t.v(t.d("strings.i18n_arabian_nights",c,p,0)));t.b("</button> <!-- accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.NightTheme",c,p,0)));t.b("\" -->\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"parchment-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_sands_of_dune",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_sands_of_dune",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option parchment-theme clickable\">");t.b(t.v(t.d("strings.i18n_sands_of_dune",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"ballard-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_ballard_blues",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_ballard_blues",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option ballard-theme clickable\">");t.b(t.v(t.d("strings.i18n_ballard_blues",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"vancouver-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_vancouver_mist",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_vancouver_mist",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option vancouver-theme clickable\">");t.b(t.v(t.d("strings.i18n_vancouver_mist",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("                </div>\r");t.b("\n" + i);t.b("                <div id=\"tab-layout\" class=\"tab-pane\" role=\"tabpanel\">\r");t.b("\n" + i);t.b("                    \r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-margins-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_margins",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                     <div class=\"row\">\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-2 icon-scale-down\">\r");t.b("\n" + i);t.b("                            <img style=\"height: 32px;\" src=\"images/margin1_off.png\" alt=\"\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-8\">\r");t.b("\n" + i);t.b("                            <input  type=\"range\" role=\"slider\" aria-labelledby=\"setting-header-margins-legend\" id=\"margin-size-input\" min=\"20\" aria-value-min=\"20\" aria-valuemin=\"20\" step=\"20\" max=\"100\" aria-value-max=\"100\" aria-valuemax=\"100\" value=\"20\" aria-valuenow=\"20\" aria-value-now=\"20\" aria-valuetext=\"20\" aria-value-text=\"20\" title=\"");t.b(t.v(t.d("strings.i18n_margins",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_margins",c,p,0)));t.b("\"/>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-2\">\r");t.b("\n" + i);t.b("                            <img style=\"height: 32px;\" src=\"images/margin4_off.png\" alt=\"\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-display-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_display_format",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                    \r");t.b("\n" + i);t.b("                    <div role=\"radiogroup\" class=\"row\" style=\"width:100%;text-align:center;\" aria-labelledby=\"setting-header-display-legend\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"spread-default-option\"\r");t.b("\n" + i);t.b("                        style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"display-format\" value=\"single\" type=\"radio\" id=\"spread-default-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"spread-default-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_spread_auto",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"one-up-option\"\r");t.b("\n" + i);t.b("                        style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            \r");t.b("\n" + i);t.b("                            <input  name=\"display-format\" value=\"single\" type=\"radio\" id=\"single-page-radio\" />\r");t.b("\n" + i);t.b("                                            <label for=\"single-page-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                            <img src=\"images/ico_singlepage_up.png\" alt=\"");t.b(t.v(t.d("strings.i18n_display_format",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_single_pages",c,p,0)));t.b("\"/>\r");t.b("\n" + i);t.b("                                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"two-up-option\"\r");t.b("\n" + i);t.b("                        style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            \r");t.b("\n" + i);t.b("                                <input  name=\"display-format\" value=\"double\" type=\"radio\" id=\"double-page-radio\" />\r");t.b("\n" + i);t.b("                                            <label for=\"double-page-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                            <img src=\"images/ico_doublepage_up.png\" alt=\"");t.b(t.v(t.d("strings.i18n_display_format",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_double_pages",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("                                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-scroll-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_scroll_mode",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                    \r");t.b("\n" + i);t.b("                    <div role=\"radiogroup\" class=\"row\" style=\"width:100%;text-align:center;\" aria-labelledby=\"setting-header-scroll-legend\">\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"scroll-default-option\" style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"scrolling\" value=\"single\" type=\"radio\" id=\"scroll-default-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"scroll-default-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_scroll_mode_auto",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"scroll-doc-option\" style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"scrolling\" value=\"single\" type=\"radio\" id=\"scroll-doc-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"scroll-doc-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                <span style=\"font-size:150%;color:#888888;\" class=\"glyphicon glyphicon-file\" aria-hidden=\"true\"></span> ");t.b(t.v(t.d("strings.i18n_scroll_mode_doc",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"scroll-continuous-option\" style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"scrolling\" value=\"single\" type=\"radio\" id=\"scroll-continuous-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"scroll-continuous-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                <span style=\"font-size:150%;color:#888888;\" class=\"glyphicon glyphicon-road\" aria-hidden=\"true\"></span> ");t.b(t.v(t.d("strings.i18n_scroll_mode_continuous",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 hiddenx=\"hidden\" id=\"setting-header-pageTransition-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_page_transition",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                    \r");t.b("\n" + i);t.b("                    <div hiddenx=\"hidden\" role=\"radiogroup\" class=\"row\" style=\"width:100%;text-align:center;\" aria-labelledby=\"setting-header-pageTransition-legend\">\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-none-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-none-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-none-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_none",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-1-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-1-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-1-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_fade",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-2-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-2-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-2-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_slide",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-3-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-3-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-3-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_swoosh",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-4-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-4-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-4-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_butterfly",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("                    \r");t.b("\n" + i);t.b("                    \r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("                    <div id=\"tab-keyboard\" class=\"tab-pane\" role=\"tabpanel\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <div class=\"row\" style=\"position:relative;\">\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <div id=\"invalid_keyboard_shortcut_ALERT\"></div>\r");t.b("\n" + i);t.b("                        \r");t.b("\n" + i);t.b("                        <ul id=\"keyboard-list\">\r");t.b("\n" + i);t.b("                        </ul>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("                     </div>\r");t.b("\n" + i);t.b("                </div>\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("            <div class=\"modal-footer\">\r");t.b("\n" + i);t.b("                <button id=\"buttClose\"  type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\" title=\"");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SettingsModalClose",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SettingsModalClose",c,p,0)));t.b("]\">");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("                <button id=\"buttSave\"  type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" title=\"");t.b(t.v(t.d("strings.i18n_save_changes",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SettingsModalSave",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_save_changes",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SettingsModalSave",c,p,0)));t.b("]\">");t.b(t.v(t.d("strings.i18n_save_changes",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("        </div>\r");t.b("\n" + i);t.b("        <!-- /.modal-content -->\r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("    <!-- /.modal-dialog -->\r");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!templates/settings-keyboard-item.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("name",c,p,1),c,p,0,9,747,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<li>\r");t.b("\n" + i);t.b("<label id=\"label_");t.b(t.v(t.f("name",c,p,0)));t.b("\">");t.b(t.v(t.f("i18n",c,p,0)));t.b("<br/><span>");t.b(t.v(t.f("name",c,p,0)));t.b("</span></label>\r");t.b("\n" + i);t.b("<input id=\"");t.b(t.v(t.f("name",c,p,0)));t.b("\" name=\"");t.b(t.v(t.f("name",c,p,0)));t.b("\" class=\"keyboardInput\" type=\"text\"  placeholder=\"");t.b(t.v(t.f("shortcut",c,p,0)));t.b("\" value=\"");t.b(t.v(t.f("shortcut",c,p,0)));t.b("\" aria-labelledbyxxx=\"label_");t.b(t.v(t.f("name",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.f("i18n",c,p,0)));t.b("\" title=\"");t.b(t.v(t.f("i18n",c,p,0)));t.b("\"></input>\r");t.b("\n" + i);t.b("<button class=\"resetKey captureKeyboardShortcut\" role=\"button\" data-key=\"");t.b(t.v(t.f("name",c,p,0)));t.b("\"  title=\"");t.b(t.v(t.d("strings.i18n_reset_key",c,p,0)));t.b(" (");t.b(t.v(t.f("def",c,p,0)));t.b(")\" aria-label=\"");t.b(t.v(t.d("strings.i18n_reset_key",c,p,0)));t.b(" (");t.b(t.v(t.f("def",c,p,0)));t.b(")\"><span aria-hidden=\"true\">&#8855;</span></button>\r");t.b("\n" + i);t.b("<span id=\"duplicate_keyboard_shortcut\" aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_duplicate_keyboard_shortcut",c,p,0)));t.b("</span>\r");t.b("\n" + i);t.b("<span id=\"invalid_keyboard_shortcut\" aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_invalid_keyboard_shortcut",c,p,0)));t.b("</span>\r");t.b("\n" + i);t.b("</li>\r");t.b("\n" + i);});c.pop();}if(!t.s(t.f("name",c,p,1),c,p,1,0,0,"")){t.b("<li id=\"resetAllKeys");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"resetAllKeys\">\r");t.b("\n" + i);t.b("<button class=\"resetKey\" role=\"button\"  title=\"");t.b(t.v(t.d("strings.i18n_reset_key_all",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_reset_key_all",c,p,0)));t.b("\"><span aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_reset_key_all",c,p,0)));t.b("  &#8855;</span></button>\r");t.b("\n" + i);t.b("</li>\r");t.b("\n" + i);};return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});

// FORK:
// https://github.com/danielweck/keymaster

//     keymaster.js
//     (c) 2011-2013 Thomas Fuchs
//     keymaster.js may be freely distributed under the MIT license.

;(function(global){
  var k,
    _handlers = {},
    _mods = { 16: false, 18: false, 17: false, 91: false },
    _scope = 'all',
    // modifier keys
    _MODIFIERS = {
      '⇧': 16, shift: 16,
      '⌥': 18, alt: 18, option: 18,
      '⌃': 17, ctrl: 17, control: 17,
      '⌘': 91, command: 91
    },
    // special keys
    _MAP = {
      backspace: 8, tab: 9, clear: 12,
      enter: 13, 'return': 13,
      esc: 27, escape: 27, space: 32,
      left: 37, up: 38,
      right: 39, down: 40,
      del: 46, 'delete': 46,
      home: 36, end: 35,
      pageup: 33, pagedown: 34,
      ',': 188, '.': 190, '/': 191,
      '`': 192, '-': 189, '=': 187,
      ';': 186, '\'': 222,
      '[': 219, ']': 221, '\\': 220
    },
    code = function(x){
      return x.toUpperCase ? (_MAP[x] || x.toUpperCase().charCodeAt(0)) : x;
    },
    _downKeys = [];

  for(k=1;k<20;k++) _MAP['f'+k] = 111+k;

  // IE doesn't support Array#indexOf, so have a simple replacement
  function index(array, item){
    var i = array.length;
    while(i--) if(array[i]===item) return i;
    return -1;
  }

  // for comparing mods before unassignment
  function compareArray(a1, a2) {
    if (a1.length != a2.length) return false;
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
  }

  var modifierMap = {
      16:'shiftKey',
      18:'altKey',
      17:'ctrlKey',
      91:'metaKey'
  };
  function updateModifierKey(event) {
      for(k in _mods) _mods[k] = event[modifierMap[k]];
  };

  function getKeyCode(event)
  {
      return event.keyCode || event.charCode || event.which || event.key || 0;
  }

  // handle keydown event
  function dispatch(event) {

    var key, handler, k, i, modifiersMatch, scope;
    key = getKeyCode(event);

    if (index(_downKeys, key) == -1) {
        _downKeys.push(key);
    }

    // if a modifier key, set the key.<modifierkeyname> property to true and return
    if(key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
    if(key in _mods) {
      _mods[key] = true;
      // 'assignKey' from inside this closure is exported to window.key
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = true;
      return;
    }
    updateModifierKey(event);

    // see if we need to ignore the keypress (filter() can can be overridden)
    // by default ignore key presses if a select, textarea, or input is focused
    if(!assignKey.filter.call(this, event)) return;

    // abort if no potentially matching shortcuts found
    if (!(key in _handlers)) return;

    scope = getScope();

    // for each potential shortcut
    for (i = 0; i < _handlers[key].length; i++) {
      handler = _handlers[key][i];

      // see if it's in the current scope
      if(handler.scope == scope || handler.scope == 'all'){
        // check if modifiers match if any
        modifiersMatch = handler.mods.length > 0;
        for(k in _mods)
          if((!_mods[k] && index(handler.mods, +k) > -1) ||
            (_mods[k] && index(handler.mods, +k) == -1)) modifiersMatch = false;
        // call the handler and stop the event if neccessary
        if((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
          if(handler.method(event, handler)===false){
            if(event.preventDefault) event.preventDefault();
              else event.returnValue = false;
            if(event.stopPropagation) event.stopPropagation();
            if(event.cancelBubble) event.cancelBubble = true;
          }
        }
      }
    }
  };

  // unset modifier keys on keyup
  function clearModifier(event){
    var key = getKeyCode(event), k,
        i = index(_downKeys, key);

    // remove key from _downKeys
    if (i >= 0) {
        _downKeys.splice(i, 1);
    }

    if(key == 93 || key == 224) key = 91;
    if(key in _mods) {
      _mods[key] = false;
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = false;
    }
  };

  function resetModifiers() {
    for(k in _mods) _mods[k] = false;
    for(k in _MODIFIERS) assignKey[k] = false;
  };

  // parse and assign shortcut
  function assignKey(key, scope, method){
    var keys, mods;
    keys = getKeys(key);
    if (method === undefined) {
      method = scope;
      scope = 'all';
    }

    // for each shortcut
    for (var i = 0; i < keys.length; i++) {
      // set modifier keys if any
      mods = [];
      key = keys[i].split('+');
      if (key.length > 1){
        mods = getMods(key);
        key = [key[key.length-1]];
      }
      // convert to keycode and...
      key = key[0]
      key = code(key);
      // ...store handler
      if (!(key in _handlers)) _handlers[key] = [];
      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
    }
  };

  // unbind all handlers for given key in current scope
  function unbindKey(key, scope) {
    var multipleKeys, keys,
      mods = [],
      i, j, obj;

    multipleKeys = getKeys(key);

    for (j = 0; j < multipleKeys.length; j++) {
      keys = multipleKeys[j].split('+');

      if (keys.length > 1) {
        mods = getMods(keys);
      }

      key = keys[keys.length - 1];
      key = code(key);

      if (scope === undefined) {
        scope = getScope();
      }
      if (!_handlers[key]) {
        return;
      }
      for (i = 0; i < _handlers[key].length; i++) {
        obj = _handlers[key][i];
        // only clear handlers if correct scope and mods match
        if (obj.scope === scope && compareArray(obj.mods, mods)) {
          _handlers[key][i] = {};
        }
      }
    }
  };

  // Returns true if the key with code 'keyCode' is currently down
  // Converts strings into key codes.
  function isPressed(keyCode) {
      if (typeof(keyCode)=='string') {
        keyCode = code(keyCode);
      }
      return index(_downKeys, keyCode) != -1;
  }

  function getPressedKeyCodes() {
      return _downKeys.slice(0);
  }

  function filter(event){
    var tagName = (event.target || event.srcElement).tagName;
    // ignore keypressed in any elements that support keyboard data input
    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
  }

  // initialize key.<modifier> to false
  for(k in _MODIFIERS) assignKey[k] = false;

  // set current scope (default 'all')
  function setScope(scope){ _scope = scope || 'all' };
  function getScope(){ return _scope || 'all' };

  // delete all handlers for a given scope
  function deleteScope(scope){
    var key, handlers, i;

    for (key in _handlers) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length; ) {
        if (handlers[i].scope === scope) handlers.splice(i, 1);
        else i++;
      }
    }
  };

  // abstract key logic for assign and unassign
  function getKeys(key) {
    var keys;
    key = key.replace(/\s/g, '');
    keys = key.split(',');
    if ((keys[keys.length - 1]) == '') {
      keys[keys.length - 2] += ',';
    }
    return keys;
  }

  // abstract mods logic for assign and unassign
  function getMods(key) {
    var mods = key.slice(0, key.length - 1);
    for (var mi = 0; mi < mods.length; mi++)
    mods[mi] = _MODIFIERS[mods[mi]];
    return mods;
  }

  // cross-browser events
  function addEvent(object, event, method) {
    if (object.addEventListener)
      object.addEventListener(event, method, false);
    else if(object.attachEvent)
      object.attachEvent('on'+event, function(){ method(window.event) });
  };

  // set the handlers globally on document
  addEvent(document, 'keydown', function(event) { dispatch(event) }); // Passing _scope to a callback to ensure it remains the same by execution. Fixes #48
  addEvent(document, 'keyup', clearModifier);

  // reset modifiers to false whenever the window is (re)focused.
  addEvent(window, 'focus', resetModifiers);

  // store previously defined key
  var previousKey = global.key;

  // restore previously defined key and return reference to our key object
  function noConflict() {
    var k = global.key;
    global.key = previousKey;
    return k;
  }

  // set window.key and window.key.set/get/deleteScope, and the default filter
  global.key = assignKey;
  global.key.setScope = setScope;
  global.key.getScope = getScope;
  global.key.deleteScope = deleteScope;
  global.key.filter = filter;
  global.key.isPressed = isPressed;
  global.key.getPressedKeyCodes = getPressedKeyCodes;
  global.key.noConflict = noConflict;
  global.key.unbind = unbindKey;

  if(typeof module !== 'undefined') module.exports = assignKey;

})(this);

define("keymaster", (function (global) {
    return function () {
        var ret, fn;
        return ret || global.key;
    };
}(this)));

define('Keyboard',['i18n/Strings', 'keymaster', 'storage/Settings'], function(Strings, key, Settings){

    var keyBindings = {};

            //https://github.com/termi/DOM-Keyboard-Event-Level-3-polyfill
            //https://gist.github.com/termi/4654819
            void function() {//closure

            var global = this
              , _initKeyboardEvent_type = (function( e ) {
            		try {
            			e.initKeyboardEvent(
            				"keyup" // in DOMString typeArg
            				, false // in boolean canBubbleArg
            				, false // in boolean cancelableArg
            				, global // in views::AbstractView viewArg
            				, "+" // [test]in DOMString keyIdentifierArg | webkit event.keyIdentifier | IE9 event.key
            				, 3 // [test]in unsigned long keyLocationArg | webkit event.keyIdentifier | IE9 event.location
            				, true // [test]in boolean ctrlKeyArg | webkit event.shiftKey | old webkit event.ctrlKey | IE9 event.modifiersList
            				, false // [test]shift | alt
            				, true // [test]shift | alt
            				, false // meta
            				, false // altGraphKey
            			);
		
		
		
            			/*
            			// Safari and IE9 throw Error here due keyCode, charCode and which is readonly
            			// Uncomment this code block if you need legacy properties
            			delete e.keyCode;
            			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
            			delete e.charCode;
            			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
            			delete e.which;
            			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
            			*/
		
            			return ((e["keyIdentifier"] || e["key"]) == "+" && (e["keyLocation"] || e["location"]) == 3) && (
            				e.ctrlKey ?
            					e.altKey ? // webkit
            						1
            						:
            						3
            					:
            					e.shiftKey ?
            						2 // webkit
            						:
            						4 // IE9
            				) || 9 // FireFox|w3c
            				;
            		}
            		catch ( __e__ ) { _initKeyboardEvent_type = 0 }
            	})( document.createEvent( "KeyboardEvent" ) )

            	, _keyboardEvent_properties_dictionary = {
            		"char": "",
            		"key": "",
            		"location": 0,
            		"ctrlKey": false,
            		"shiftKey": false,
            		"altKey": false,
            		"metaKey": false,
            		"repeat": false,
            		"locale": "",

            		"detail": 0,
            		"bubbles": false,
            		"cancelable": false,
	
            		//legacy properties
            		"keyCode": 0,
            		"charCode": 0,
            		"which": 0
            	}

            	, own = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

            	, _Object_defineProperty = Object.defineProperty || function(obj, prop, val) {
            		if( "value" in val ) {
            			obj[prop] = val["value"];
            		}
            	}
            ;

            function crossBrowser_initKeyboardEvent(type, dict) {
            	var e;
            	if( _initKeyboardEvent_type ) {
            		e = document.createEvent( "KeyboardEvent" );
            	}
            	else {
            		e = document.createEvent( "Event" );
            	}

                // // Chromium Hack
                // try
                // {
                // Object.defineProperty(e, 'keyCode', {
                //             get : function() {
                //                 return this.keyCodeVal;
                //             }
                // });     
                // }catch(){}
                // 
                // try
                // {
                // Object.defineProperty(e, 'which', {
                //             get : function() {
                //                 return this.keyCodeVal;
                //             }
                // });
                // }catch(){} 

            
            	var _prop_name
            		, localDict = {};

            	for( _prop_name in _keyboardEvent_properties_dictionary ) if(own(_keyboardEvent_properties_dictionary, _prop_name) ) {
            		localDict[_prop_name] = (own(dict, _prop_name) && dict || _keyboardEvent_properties_dictionary)[_prop_name];
            	}

            	var _ctrlKey = localDict["ctrlKey"]
            		, _shiftKey = localDict["shiftKey"]
            		, _altKey = localDict["altKey"]
            		, _metaKey = localDict["metaKey"]
            		, _altGraphKey = localDict["altGraphKey"]

            		, _modifiersListArg = _initKeyboardEvent_type > 3 ? (
            			(_ctrlKey ? "Control" : "")
            				+ (_shiftKey ? " Shift" : "")
            				+ (_altKey ? " Alt" : "")
            				+ (_metaKey ? " Meta" : "")
            				+ (_altGraphKey ? " AltGraph" : "")
            			).trim() : null

            		, _key = localDict["key"] + ""
            		, _char = localDict["char"] + ""
            		, _location = localDict["location"]
            		, _keyCode = localDict["keyCode"] || (localDict["keyCode"] = _key && _key.charCodeAt( 0 ) || 0)
            		, _charCode = localDict["charCode"] || (localDict["charCode"] = _char && _char.charCodeAt( 0 ) || 0)

            		, _bubbles = localDict["bubbles"]
            		, _cancelable = localDict["cancelable"]

            		, _repeat = localDict["repeat"]
            		, _locale = localDict["locale"]
            		, _view = global
            	;

            	localDict["which"] || (localDict["which"] = localDict["keyCode"]);

                //e.keyCodeVal = _keyCode;
            
            	if( "initKeyEvent" in e ) {//FF
            		//https://developer.mozilla.org/en/DOM/event.initKeyEvent
            		e.initKeyEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
            	}
            	else if(  _initKeyboardEvent_type && "initKeyboardEvent" in e ) {//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
            		if( _initKeyboardEvent_type == 1 ) { // webkit
            			//http://stackoverflow.com/a/8490774/1437207
            			//https://bugs.webkit.org/show_bug.cgi?id=13368
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _shiftKey, _altKey, _metaKey, _altGraphKey );
            		}
            		else if( _initKeyboardEvent_type == 2 ) { // old webkit
            			//http://code.google.com/p/chromium/issues/detail?id=52408
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
            		}
            		else if( _initKeyboardEvent_type == 3 ) { // webkit
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _altKey, _shiftKey, _metaKey, _altGraphKey );
            		}
            		else if( _initKeyboardEvent_type == 4 ) { // IE9
            			//http://msdn.microsoft.com/en-us/library/ie/ff975297(v=vs.85).aspx
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _modifiersListArg, _repeat, _locale );
            		}
            		else { // FireFox|w3c
            			//http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent-initKeyboardEvent
            			//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _char, _key, _location, _modifiersListArg, _repeat, _locale );
            		}
            	}
            	else {
            		e.initEvent(type, _bubbles, _cancelable)
            	}

            	for( _prop_name in _keyboardEvent_properties_dictionary )if( own( _keyboardEvent_properties_dictionary, _prop_name ) ) {
            		if( e[_prop_name] != localDict[_prop_name] ) {
            			try {
            				delete e[_prop_name];
            				_Object_defineProperty( e, _prop_name, { writable: true, "value": localDict[_prop_name] } );
            			}
            			catch(ex) {
            				//Some properties is read-only
// console.debug("PROP EX: " + ex);
// e[_prop_name] = _keyCode;
// console.debug("PROP AFTER: " + e[_prop_name]);
            			}
		
            		}
            	}

            	return e;
            }

            //export
            global.crossBrowser_initKeyboardEvent = crossBrowser_initKeyboardEvent;

            }.call(window);
            
            
	Keyboard = {	
        resetToDefaults: function()
        {
            // reset current scheme to defaultOptions
            for (prop in Keyboard.defaultOptions)
            {
                if (!Keyboard.defaultOptions.hasOwnProperty(prop)) continue;

                if (typeof Keyboard.defaultOptions[prop] !== 'string') continue;

                Keyboard[prop] = Keyboard.defaultOptions[prop];
            }
        },
        resetAccessKeys: function()
        {
            // reset access keys
            var extractAccessKey = function(keyboardShortcut)
            {
                if (!keyboardShortcut || !keyboardShortcut.length) return "";

                var char = keyboardShortcut[keyboardShortcut.length-1];
                if (/^[a-z0-9]+$/i.test(char)) return char;

                return "";
            };
            Keyboard.accesskeys = {};
            for (prop in Keyboard)
            {
                if (!Keyboard.hasOwnProperty(prop)) continue;

                var str = Keyboard[prop];

                if (typeof str !== 'string') continue;

                Keyboard.accesskeys[prop] = extractAccessKey(str);
            }
        },
        applySettings: function(json)
        {
            this.resetToDefaults();
            
            if (json && json.keyboard)
            {
                // override with user options
                for (prop in Keyboard)
                {
                    if (!Keyboard.hasOwnProperty(prop)) continue;
    
                    if (typeof Keyboard[prop] !== 'string') continue;
            
                    if (typeof json.keyboard[prop] !== 'string') continue;
    
                    Keyboard[prop] = json.keyboard[prop];
                }
            }

            this.resetAccessKeys();
        },
        dispatch: function(target, e)
        {
            //THIS FUNCTION NOT REACHED WHEN e.stopPropagation(); INVOKED IN IFRAME's HTML
            
            if (e.cancelBubble)
            {
                //WHEN e.cancelBubble = true IN IFRAME's HTML's own event callback
                return;
            }
            
            if (e.defaultPrevented)
            {
                //WHEN e.preventDefault() INVOKED IN IFRAME's HTML
                return;
            }
            
            if (typeof e.returnValue !== "undefined" && !e.returnValue)
            {
                //WHEN e.returnValue = false IN IFRAME's HTML's own event callback
                return;
            }
            
            var source = e.srcElement || e.target;
            if (source)
            {
                var parent = source;
                while (parent)
                {
                    var name = parent.nodeName;
                    if (name === "input" || name === "textarea")
                    {
                        return;
                    }
                    
                    if (parent.getAttribute)
                    {
                        var ce = parent.getAttribute("contenteditable");
                        if (ce === "true" || ce === "contenteditable")
                        {
                            return;
                        }
                    }
                 
                    if (parent.classList && parent.classList.contains("keyboard-input"))
                    {
                        return;
                    }
                    
                    parent = parent.parentNode;
                }
            }
            
            
            // //var newE = jQuery.extend(true, {}, e);// deep copy
            // var newE = $.extend($.Event(e.type), {}, e);
            // 
            // newE.preventDefault();
            // newE.stopPropagation();
            // newE.stopImmediatePropagation();
            // 
            // newE.originalEvent.bubbles = false;
            // newE.originalEvent.srcElement = document.documentElement;
            // newE.originalEvent.target = document.documentElement;
            // newE.originalEvent.view = window;
            
            var ev = crossBrowser_initKeyboardEvent(e.type, {
                "bubbles": true,
                "cancelable": false,
                
                "keyCode": e.keyCode,
                "charCode": e.charCode,
                "which": e.which,
                
                "ctrlKey": e.ctrlKey,
                "shiftKey": e.shiftKey,
                "altKey": e.altKey,
                "metaKey": e.metaKey,
                
                //https://developer.mozilla.org/en-US/docs/Web/API/event.which
                "char": e.char ? e.char : String.fromCharCode(e.charCode), // lower/upper case-sensitive
                "key": e.key ? e.key : e.keyCode // case-insensitive
            });

            //$(target).trigger(e);
            target.dispatchEvent(ev);
        },
        scope: function(scope)
        {
            if (!scope) alert("!SCOPE ACTIVATE!");
            
            key.setScope(scope);
        },
        on: function(keys, scope, callback)
        {
            if (!keys) console.error("!KEYS!");
            
            if (!keyBindings.hasOwnProperty(scope))
            {
                keyBindings[scope] = [];
            }
            keyBindings[scope].push(keys);
            
            key.unbind(keys, scope);
            key(keys, scope, function()
            {
                $(document.body).addClass("keyboard");
                callback();
            });
        },
        off: function(scope)
        {
            if (!scope) alert("!SCOPE OFF!");
            
            if (!keyBindings.hasOwnProperty(scope)) return;
            
            for (k in keyBindings[scope])
            {
                key.unbind(k, scope);
            }
        },
        i18n:
        {
            ShowSettingsModal: Strings.settings,
        
            SettingsModalSave: Strings.settings + " - " + Strings.i18n_save_changes,
            SettingsModalClose: Strings.settings + " - " + Strings.i18n_close,
        
            PagePrevious: Strings.i18n_page_previous,
            PageNext: Strings.i18n_page_next,
            PagePreviousAlt: Strings.i18n_page_previous + " (access key)",
            PageNextAlt: Strings.i18n_page_next + " (access key)",
        
            ToolbarShow: Strings.i18n_toolbar_show,
            ToolbarHide: Strings.i18n_toolbar_hide,
        
            FullScreenToggle: Strings.enter_fullscreen + " / " + Strings.exit_fullscreen,
        
            SwitchToLibrary: Strings.view_library,
        
            TocShowHideToggle: Strings.toc,
        
            NightTheme: Strings.i18n_arabian_nights,
        
            //MediaOverlaysPlayPauseAlt: Strings.i18n_audio_play + " / " + Strings.i18n_audio_pause,
            MediaOverlaysPlayPause: Strings.i18n_audio_play + " / " + Strings.i18n_audio_pause,
            
            MediaOverlaysPrevious: Strings.i18n_audio_previous,
            MediaOverlaysNext: Strings.i18n_audio_next,
        
            MediaOverlaysEscape: Strings.i18n_audio_esc,
        
            MediaOverlaysRateIncrease: Strings.i18n_audio_rate_increase,
            MediaOverlaysRateDecrease: Strings.i18n_audio_rate_decrease,
            //MediaOverlaysRateIncreaseAlt: "",
            //MediaOverlaysRateDecreaseAlt: "",
            MediaOverlaysRateReset: Strings.i18n_audio_rate_reset,
        
            MediaOverlaysVolumeIncrease: Strings.i18n_audio_volume_increase,
            MediaOverlaysVolumeDecrease: Strings.i18n_audio_volume_decrease,
            //MediaOverlaysVolumeIncreaseAlt: "",
            //MediaOverlaysVolumeDecreaseAlt: "",
            MediaOverlaysVolumeMuteToggle: Strings.i18n_audio_mute + " / " + Strings.i18n_audio_unmute,
        
            MediaOverlaysAdvancedPanelShowHide: Strings.i18n_audio_expand,
            
            BackgroundAudioPlayPause: Strings.i18n_audio_play_background + " / " + Strings.i18n_audio_pause_background
        },
        defaultOptions:  {},
        accesskeys: {}, // single key strokes are dynamically populated, based on the full shortcuts below:
        ShowSettingsModal: 'o', //accesskey'ed
        
        SettingsModalSave: 's', //accesskey'ed
        SettingsModalClose: 'c', //accesskey'ed
        
        PagePrevious: 'left', // ALT BELOW
        PageNext: 'right', // ALT BELOW
        PagePreviousAlt: '1', //accesskey'ed
        PageNextAlt: '2', //accesskey'ed
        
        ToolbarShow: 'v', //accesskey'ed
        ToolbarHide: 'x', //accesskey'ed
        
        FullScreenToggle: 'h', //accesskey'ed
        
        SwitchToLibrary: 'b', //accesskey'ed
        
        TocShowHideToggle: 't', //accesskey'ed
        
        NightTheme: 'n', //accesskey'ed
        
        MediaOverlaysEscape: 'r', //accesskey'ed
        
        //MediaOverlaysPlayPauseAlt: 'p', // ALT BELOW
        MediaOverlaysPlayPause: 'm', //accesskey'ed
        
        MediaOverlaysRateIncrease: 'l', //accesskey'ed
        MediaOverlaysRateDecrease: 'j', //accesskey'ed
        //MediaOverlaysRateIncreaseAlt: 'F8', //??
        //MediaOverlaysRateDecreaseAlt: 'shift+F8', //??
        MediaOverlaysRateReset: 'k', //accesskey'ed
        
        MediaOverlaysVolumeIncrease: 'w', //accesskey'ed
        MediaOverlaysVolumeDecrease: 'q', //accesskey'ed
        //MediaOverlaysVolumeIncreaseAlt: 'F7', //??
        //MediaOverlaysVolumeDecreaseAlt: 'shift+F7', //??
        MediaOverlaysVolumeMuteToggle: 'a', //accesskey'ed
        
        MediaOverlaysPrevious: 'y', //accesskey'ed
        MediaOverlaysNext: 'u', //accesskey'ed
        
        MediaOverlaysAdvancedPanelShowHide: 'g', //accesskey'ed
        
        BackgroundAudioPlayPause: 'd'
	};

    try
    {
        // reset defaultOptions with the hard-coded values
        Keyboard.defaultOptions = {};
        for (prop in Keyboard)
        {
            if (!Keyboard.hasOwnProperty(prop)) continue;

            if (typeof Keyboard[prop] !== 'string') continue;

            Keyboard.defaultOptions[prop] = Keyboard[prop];
        }
        
        // too early (async reader.options storage lookup)
        // Settings.get('reader', function(json)
        // {
        //    Keyboard.applySettings(json);
        // }); 
        
        //unnecessary
        //Keyboard.resetToDefaults();
        
        //necessary!
        Keyboard.resetAccessKeys();
    }
    catch(e)
    {
        console.error(e);
    }
    
	return Keyboard;
});
define('ReaderSettingsDialog_Keyboard',['hgn!templates/settings-keyboard-item.html', 'i18n/Strings', 'Dialogs', 'storage/Settings', 'Keyboard', 'underscore'], function(KeyboardItem, Strings, Dialogs, Settings, Keyboard, _){

    
    var checkKeyboardShortcuts = function($focusedInput, typing)
    {
        var duplicate = false;
        var invalid = false;

        var $keyboardList = $("#keyboard-list");
    
        var wasAlert = $keyboardList.hasClass("atLeastOneInvalidOrDuplicateShortcut");
    
        $keyboardList.removeClass("atLeastOneInvalidOrDuplicateShortcut");
        
        var alertInvalidKeyboard = $("#invalid_keyboard_shortcut_ALERT")[0];
        
        alertInvalidKeyboard.removeAttribute("role");
        alertInvalidKeyboard.removeAttribute("aria-live");
        alertInvalidKeyboard.removeAttribute("aria-atomic");

        //alertInvalidKeyboard.style.clip = "rect(0px,0px,0px,0px)";
        
        while (alertInvalidKeyboard.firstChild) {
            alertInvalidKeyboard.removeChild(alertInvalidKeyboard.firstChild);
        }
        
        var focusedInputIsInvalid = false;
        
        var $inputs = $(".keyboardInput");
        $inputs.each(function()
        {
            var $that = $(this);

            $that.parent().removeClass("duplicateShortcut");
            $that[0].removeAttribute("aria-invalid");
            
            checkKeyboardShortcut($that, typing);
            
            if ($that.parent().hasClass("invalidShortcut"))
            {
                $that[0].setAttribute("aria-invalid", "true");
                invalid = true;
                
                if ($focusedInput && $focusedInput.length && $focusedInput[0] === $that[0])
                {
                    focusedInputIsInvalid = true;
                }
            }
        });

        var focusedInputIsDuplicate = false;

        for (var i = 0; i < 2; i++) // 2-pass process
        {
            // duplicates
            $inputs.each(function()
            {
                var $that = $(this);
                
                var thatInvalid = $that.parent().hasClass("invalidShortcut");
                var thatDuplicate = $that.parent().hasClass("duplicateShortcut");
                var thatOriginal = $that.attr("placeholder");
            
                var thatVal = thatInvalid || thatDuplicate ? thatOriginal : $that.attr("data-val");
                
                if (thatDuplicate) return true; // continue (second pass)
                
                $inputs.each(function()
                {
                    var $self = $(this);
                    if ($self[0] === $that[0]) return true; //continue
            
                    var selfOriginal = $self.attr("placeholder");
                
                    var selfInvalid = $self.parent().hasClass("invalidShortcut");
                
                    var selfDuplicate = $self.parent().hasClass("duplicateShortcut");
                
                    var selfVal = selfInvalid || selfDuplicate ? selfOriginal : $self.attr("data-val");
                
                    if (thatVal === selfVal)
                    {
                        duplicate = true;
                
                        if ($focusedInput && $focusedInput.length && ($focusedInput[0] === $that[0] || $focusedInput[0] === $self[0]))
                        {
                            focusedInputIsDuplicate = true;
                        }

                        $that[0].setAttribute("aria-invalid", "true");
                        $self[0].setAttribute("aria-invalid", "true");
                    
                        if (!$self.parent().hasClass("duplicateShortcut")) $self.parent().addClass("duplicateShortcut");
                        if (!$that.parent().hasClass("duplicateShortcut")) $that.parent().addClass("duplicateShortcut");
                    }
                });
            });
        }
        
        if (duplicate || invalid)
        {
            $keyboardList.addClass("atLeastOneInvalidOrDuplicateShortcut");

            if (focusedInputIsInvalid || focusedInputIsDuplicate)
            {
                if (wasAlert)
                    alertInvalidKeyboard.setAttribute("aria-live", "polite");
                else
                    alertInvalidKeyboard.setAttribute("role", "alert"); //alertInvalidKeyboard.setAttribute("aria-live", "assertive");
                                
                alertInvalidKeyboard.setAttribute("aria-atomic", "true");
            
                var txt = document.createTextNode(focusedInputIsInvalid ? Strings.i18n_invalid_keyboard_shortcut : Strings.i18n_duplicate_keyboard_shortcut);
                alertInvalidKeyboard.appendChild(txt);
            
                //alertInvalidKeyboard.style.clip = "auto";
                
                alertInvalidKeyboard.style.visibility = "hidden";
                alertInvalidKeyboard.style.visibility = "visible";
            }
        }
    };
    
    var checkKeyboardShortcut = function($input, typing)
    {
        $input.parent().removeClass("invalidShortcut");
        $input.attr("data-val", $input.val());
        
        var current = $input.val().toLowerCase().trim();
        
        var shift = false;
        var ctrl = false;
        var alt = false;
        
        if (current.indexOf("shift") >= 0) shift = true;
        if (current.indexOf("ctrl") >= 0) ctrl = true;
        if (current.indexOf("alt") >= 0) alt = true;
        
        var hasPlus = current.lastIndexOf("+") === current.length - 1;
        
        current = current.replace(/shift/g, '');
        current = current.replace(/ctrl/g, '');
        current = current.replace(/alt/g, '');
        current = current.replace(/\+/g, '');
        current = current.replace(/\s/g, '');
        current = current.trim();
        
        if (hasPlus)
        {
            current = current + "+";
        }
        
        if (current.match(/^[0-9A-Za-z]$/) || current.match(/^backspace$/) || current.match(/^space$/) || current.match(/^return$/) || current.match(/^enter$/) || current.match(/^left$/) || current.match(/^right$/) || current.match(/^up$/) || current.match(/^down$/))
        {
            var normalised = (shift?"shift + ":"") + (ctrl?"ctrl + ":"") + (alt?"alt + ":"") + current;
            $input.attr("data-val", normalised);
            if (!typing) $input.val(normalised);
        }
        else
        {
            $input.parent().addClass("invalidShortcut");
        }
    };
    
    var initKeyboardList = function()
    {
        var $keyboardList = $("#keyboard-list");
    
        $keyboardList.empty();
        
        $keyboardList.append(KeyboardItem({strings: Strings, id: "TOP" }));
        
        for (prop in Keyboard)
        {
            if (!Keyboard.hasOwnProperty(prop)) continue;

            if (typeof Keyboard[prop] !== 'string') continue;

            $keyboardList.append(KeyboardItem({strings: Strings, keyboard: Keyboard, name: prop, shortcut: Keyboard[prop], i18n: Keyboard.i18n[prop], def: Keyboard.defaultOptions[prop] }));
        }

        $keyboardList.append(KeyboardItem({strings: Strings, id: "BOTTOM" }));
        
        checkKeyboardShortcuts();
        
        var _previousInputVal = undefined;
        
        $(".keyboardInput").on("blur",
        function(e)
        {
            var $that = $(this);
            _previousInputVal = undefined;
            checkKeyboardShortcuts();
        });
        
        $(".keyboardInput").on("focus",
        function(e)
        {
            var $that = $(this);
            checkKeyboardShortcuts($that, true);
        });

        var debouncedKeyboardValidator = _.bind(_.debounce(checkKeyboardShortcuts, 700), this);
        
        $(".keyboardInput").on("keyup", function(){
            var $that = $(this);
            var val = $that.val();
            if (val !== _previousInputVal)
            {
                debouncedKeyboardValidator($that, true);
            }
            _previousInputVal = val;
        });
         
        // KEYSTROKE CAPTURE DOES NOT WORK, BECAUSE HTML ACCESSKEYS GET IN THE WAY (e.g. CTRL ALT M => play audio)
        // var oldScope = undefined;
        // $(".captureKeyboardShortcut").on("focus",
        // function(e)
        // {
        //     oldScope = key.getScope();
        //     key.setScope("captureKeyboardShortcut");
        // });
        // $(".captureKeyboardShortcut").on("blur",
        // function(e)
        // {
        //     if (oldScope) key.setScope(oldScope);
        // });
        // $(".captureKeyboardShortcut").on("keydown",
        // //document.addEventListener('keydown',
        // function()
        // {
        //     // var clazz = (e.sourceElement || e.target).getAttribute("class");
        //     // if (!clazz || clazz.indexOf("captureKeyboardShortcut") < 0) return;
        //     
        //     //str.charCodeAt(0);
        //     console.log(key.shift);
        //     console.log(key.control);
        //     console.log(key.alt);
        //     console.log(key.command);
        //     console.log(key.getPressedKeyCodes());
        //     
        //     var keys = key.getPressedKeyCodes();
        //     if (keys && keys.length) keys = keys[0];
        // 
        //     var keystroke = (key.shift ? "shift+" : "") + (key.control ? "ctrl+" : "") + (key.alt ? "alt+" : "") + (key.command ? "command+" : "") + keys;
        // 
        //     $that = $(this);
        //     var id = $that.attr("data-key");
        //     $input = $("input#"+id);
        //     $input.val(keystroke);
        // 
        //     // e.preventDefault();
        //     // e.stopPropagation();
        //     // return false;
        // });

        $(".resetKey").on("click", function()
        {
            $that = $(this);
            var id = $that.attr("data-key");
            if (id)
            {
                var $input = $("input#"+id);
                
                //$input.val($input.attr("placeholder"));
                $input.val(Keyboard.defaultOptions[id]);
            }
            else
            {
                //$(".resetKey[data-key]").trigger("click");
                $(".resetKey[data-key]").each(function()
                {
                    var $self = $(this);
                    var id = $self.attr("data-key");
                    if (id)
                    {
                        var $input = $("input#"+id);
                
                        //$input.val($input.attr("placeholder"));
                        $input.val(Keyboard.defaultOptions[id]);
                    }
                });
            }

            checkKeyboardShortcuts();
        });
    };
    
    var saveKeys = function()
    {
        var atLeastOneChanged = false;
        var keys = {};
        
        checkKeyboardShortcuts();
        $(".keyboardInput").each(function()
        {
            var $that = $(this);
            
            var original = $that.attr("placeholder");
            var id = $that.attr("id");
            
            var val = $that.attr("data-val");
            //var valShown = $that.val();

            if ($that.parent().hasClass("invalidShortcut") || $that.parent().hasClass("duplicateShortcut"))
            {
                // if (original === val) return true; // continue (effectively resets to the default valid value)
                val = original;
            }
            
            if (!val.length) return true; // continue

            val = val.toLowerCase();

            if (original !== val) atLeastOneChanged = true;

            if (val !== Keyboard.defaultOptions[id])
            {
                keys[id] = val;
            }
        });
        if (atLeastOneChanged)
        {
            // TODO: anything more elegant than alert() ?
            //alert(Strings.i18n_keyboard_reload);
            
            Dialogs.showModalMessage("Readium - " + Strings.i18n_keyboard_shortcuts, Strings.i18n_keyboard_reload);
        }
        
        return keys;
    };

	return {
		initKeyboardList : initKeyboardList,
        saveKeys : saveKeys
	}
});
define('ReaderSettingsDialog',['hgn!templates/settings-dialog.html', 'ReaderSettingsDialog_Keyboard', 'i18n/Strings', 'Dialogs', 'storage/Settings', 'Keyboard'], function(SettingsDialog, KeyboardSettings, Strings, Dialogs, Settings, Keyboard){
	var defaultSettings = {
        fontSize: 100,
        syntheticSpread: "auto",
        scroll: "auto",
        columnGap: 60
    }
    
    var getBookStyles = function(theme){
        var isAuthorTheme = theme === "author-theme";
    	var $previewText = $('.preview-text');
    	setPreviewTheme($previewText, theme);
    	var previewStyle = window.getComputedStyle($previewText[0]);
    	var bookStyles = [{selector: 'body', declarations: {
            backgroundColor: isAuthorTheme ? "" : previewStyle.backgroundColor,
            color: isAuthorTheme ? "" : previewStyle.color
        }}];
        return bookStyles;
    }
    var setPreviewTheme = function($previewText, newTheme){
        var previewTheme = $previewText.attr('data-theme');
        $previewText.removeClass(previewTheme);
        $previewText.addClass(newTheme);
        $previewText.attr('data-theme', newTheme);
    }
    
    var updateReader = function(reader, readerSettings){
        reader.updateSettings(readerSettings); // triggers on pagination changed

        if (readerSettings.theme){
            //$("html").addClass("_" + readerSettings.theme);
            $("html").attr("data-theme", readerSettings.theme);
            
            var bookStyles = getBookStyles(readerSettings.theme);
            reader.setBookStyles(bookStyles);
            $('#reading-area').css(bookStyles[0].declarations);
        }
    }
    
    var updateSliderLabels = function($slider, val, txt, label)
    {
        $slider.attr("aria-valuenow", val+"");
        $slider.attr("aria-value-now", val+"");
        
        $slider.attr("aria-valuetext", txt+"");
        $slider.attr("aria-value-text", txt+"");
        
        $slider.attr("title", label + " " + txt);
        $slider.attr("aria-label", label + " " + txt);
    };

	var initDialog = function(reader){
		$('#app-container').append(SettingsDialog({strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));

		$previewText = $('.preview-text');
        $('.theme-option').on('click', function(){
            var newTheme = $(this).attr('data-theme');
            setPreviewTheme($previewText, newTheme);
        });
        
        var $marginSlider = $("#margin-size-input");
        $marginSlider.on("change",
        function() {
            var val = $marginSlider.val();
            
            updateSliderLabels($marginSlider, val, val + "px", Strings.i18n_margins);
        }
        );
        
        var $fontSizeSlider = $("#font-size-input");
        $fontSizeSlider.on('change', function(){
            var fontSize = $fontSizeSlider.val();
            
            $previewText.css({fontSize: (fontSize/100) + 'em'});
            
            updateSliderLabels($fontSizeSlider, fontSize, fontSize + '%', Strings.i18n_font_size);
        });

        $('#tab-butt-main').on('click', function(){
            $("#tab-keyboard").attr('aria-expanded', "false");
            $("#tab-main").attr('aria-expanded', "true");
        });
        $('#tab-butt-keys').on('click', function(){
            $("#tab-main").attr('aria-expanded', "false");
            $("#tab-keyboard").attr('aria-expanded', "true");
        });
        $('#buttSave').on('keydown',function(evt) {
            if(evt.which === 9 && !(evt.shiftKey | evt.ctrlKey | evt.metaKey | evt.altKey)) { // TAB pressed
              evt.preventDefault();
              $('#closeSettingsCross').focus();
            }
        });
        $('#closeSettingsCross').on('keydown',function(evt) {
            if(evt.which === 9 && evt.shiftKey) { // shift-TAB pressed
              evt.preventDefault();
              $('#buttSave').focus();
            }
        });
        
        $('#settings-dialog').on('hide.bs.modal', function(){ // IMPORTANT: not "hidden.bs.modal"!! (because .off() in
        
            // Safety: "save" button click
            setTimeout(function(){
                $("#keyboard-list").empty();
            }, 500);
        });
        
        $('#settings-dialog').on('show.bs.modal', function(){ // IMPORTANT: not "shown.bs.modal"!! (because .off() in library vs. reader context)

            $('#tab-butt-main').trigger("click");
            KeyboardSettings.initKeyboardList();

            setTimeout(function(){ $('#closeSettingsCross')[0].focus(); }, 1000); //tab-butt-main
        
            Settings.get('reader', function(readerSettings){
                readerSettings = readerSettings || defaultSettings;
                for (prop in defaultSettings)
                {
                    if (defaultSettings.hasOwnProperty(prop) && !readerSettings.hasOwnProperty(prop) && !readerSettings[prop])
                    {
                        readerSettings[prop] = defaultSettings[prop];
                    }
                }

                $fontSizeSlider.val(readerSettings.fontSize);
                updateSliderLabels($fontSizeSlider, readerSettings.fontSize, readerSettings.fontSize + '%', Strings.i18n_font_size);
                
                
                $marginSlider.val(readerSettings.columnGap);
                updateSliderLabels($marginSlider, readerSettings.columnGap, readerSettings.columnGap + "px", Strings.i18n_margins);

                if (readerSettings.syntheticSpread == "double"){
                    $('#two-up-option input').prop('checked', true);
                }
                else if (readerSettings.syntheticSpread == "single"){
                    $('#one-up-option input').prop('checked', true);
                }
                else {
                    $('#spread-default-option input').prop('checked', true);
                }
                
                if(readerSettings.scroll == "scroll-doc") {
                    $('#scroll-doc-option input').prop('checked', true);
                }
                else if(readerSettings.scroll == "scroll-continuous") {
                    $('#scroll-continuous-option input').prop('checked', true);
                }
                else {
                    $('#scroll-default-option input').prop('checked', true);
                }
                
                if (readerSettings.pageTransition === 0)
                {
                    $('#pageTransition-1-option input').prop('checked', true);
                }
                else if (readerSettings.pageTransition === 1)
                {
                    $('#pageTransition-2-option input').prop('checked', true);
                }
                else if (readerSettings.pageTransition === 2)
                {
                    $('#pageTransition-3-option input').prop('checked', true);
                }
                else if (readerSettings.pageTransition === 3)
                {
                    $('#pageTransition-4-option input').prop('checked', true);
                }
                else
                {
                    $('#pageTransition-none-option input').prop('checked', true);
                }
                
                if (readerSettings.theme){
                    setPreviewTheme($previewText, readerSettings.theme);
                }
                
                $previewText.css({fontSize: (readerSettings.fontSize/100) + 'em'});
            });
        });

        var save = function(){
            
            var readerSettings = {
                fontSize: Number($fontSizeSlider.val()),
                syntheticSpread: "auto",
                columnGap: Number($marginSlider.val()),
                scroll: "auto"
            };

            if($('#scroll-doc-option input').prop('checked')) {
                readerSettings.scroll = "scroll-doc";
            }
            else if($('#scroll-continuous-option input').prop('checked')) {
                readerSettings.scroll = "scroll-continuous";
            }

            if($('#two-up-option input').prop('checked')) {
                readerSettings.syntheticSpread = "double";
            }
            else if($('#one-up-option input').prop('checked')) {
                readerSettings.syntheticSpread = "single";
            }

            if($('#pageTransition-1-option input').prop('checked')) {
                readerSettings.pageTransition = 0;
            } else if($('#pageTransition-2-option input').prop('checked')) {
                readerSettings.pageTransition = 1;
            } else if($('#pageTransition-3-option input').prop('checked')) {
                readerSettings.pageTransition = 2;
            } else if($('#pageTransition-4-option input').prop('checked')) {
                readerSettings.pageTransition = 3;
            } else {
                readerSettings.pageTransition = -1;
            }

            readerSettings.theme = $previewText.attr('data-theme');
            if (reader){
               updateReader(reader, readerSettings);
	        }


            var keys = KeyboardSettings.saveKeys();
            
            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                for (prop in readerSettings)
                {
                    if (readerSettings.hasOwnProperty(prop))
                    {
                        json[prop] = readerSettings[prop];
                    }
                }

                json.keyboard = keys;
                // if (keys)
                // {
                //     for (prop in keys)
                //     {
                //         if (keys.hasOwnProperty(prop))
                //         {
                //             json.keyboard[prop] = keys[prop];
                //         }
                //     }
                // }

                Settings.put('reader', json);
                
                setTimeout(function()
                {
                    Keyboard.applySettings(json);
                }, 100);
            });
        };
        
        Keyboard.on(Keyboard.NightTheme, 'settings', function(){

                Settings.get('reader', function(json)
                {
                    if (!json)
                    {
                        json = {};
                    }

                    var isNight = json.theme === "night-theme";
                    json.theme = isNight ? "author-theme" : "night-theme";
                    
                    Settings.put('reader', json);

                    if (reader) updateReader(reader, json);
                });
        });
        
        Keyboard.on(Keyboard.SettingsModalSave, 'settings', function() {
            save();
            $('#settings-dialog').modal('hide');
        });

        Keyboard.on(Keyboard.SettingsModalClose, 'settings', function() {
            $('#settings-dialog').modal('hide');
        });
        
        $('#settings-dialog .btn-primary').on('click', save);
	}

	return {
		initDialog : initDialog,
		updateReader : updateReader,
		defaultSettings : defaultSettings
	}
});


define("hgn!templates/about-dialog.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"modal fade\" id=\"about-dialog\" tabindex=\"-1\" role=\"dialog\" aria-label=\"");t.b(t.t(t.d("strings.about",c,p,0)));t.b("\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("  <div class=\"modal-dialog\">\r");t.b("\n" + i);t.b("    <div class=\"modal-content\">\r");t.b("\n" + i);t.b("      <div class=\"modal-body\">\r");t.b("\n" + i);t.b("      	<div class=\"splash-logo\">\r");t.b("\n" + i);t.b("      		<img src=\"images/about_readium_logo.png\" alt=\"\">\r");t.b("\n" + i);t.b("      	</div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("      	<div class=\"about-message\">\r");t.b("\n" + i);t.b("	      	<span>");t.b(t.t(t.d("strings.i18n_html_readium_tm_a_project",c,p,0)));t.b("</span>\r");t.b("\n" + i);t.b("      	</div>\r");t.b("\n" + i);t.b("      	<div>\r");t.b("\n" + i);t.b("			     <img src=\"images/partner_logos.png\">\r");t.b("\n" + i);t.b("		    </div>\r");t.b("\n" + i);t.b("        <h4 style=\"color:#111155\">");t.b(t.t(t.d("strings.gethelp",c,p,0)));t.b("</h4>\r");t.b("\n" + i);t.b("        <div class=\"version\">");t.b(t.v(t.d("viewer.chromeVersion",c,p,0)));t.b("</div>\r");t.b("\n" + i);t.b("        <div class=\"build-date\">");t.b(t.v(t.d("viewer.dateTimeString",c,p,0)));t.b("</div>\r");t.b("\n" + i);t.b("        <div class=\"version-details\">\r");t.b("\n" + i);t.b("        <div><a target=\"_blank\" href=\"https://github.com/readium/readium-js-viewer/tree/");t.b(t.v(t.d("viewer.sha",c,p,0)));t.b("\">readium-js-viewer@");t.b(t.v(t.d("viewer.sha",c,p,0)));t.b("</a>");if(!t.s(t.d("viewer.clean",c,p,1),c,p,1,0,0,"")){t.b("<span class=\"local-changes-alert\">(with local changes)</span>");};t.b("</div>\r");t.b("\n" + i);t.b("          <div><a target=\"_blank\" href=\"https://github.com/readium/readium-js/tree/");t.b(t.v(t.d("readium.sha",c,p,0)));t.b("\">readium-js@");t.b(t.v(t.d("readium.sha",c,p,0)));t.b("</a>");if(!t.s(t.d("readium.clean",c,p,1),c,p,1,0,0,"")){t.b("<span class=\"local-changes-alert\">(with local changes)</span>");};t.b("</div>\r");t.b("\n" + i);t.b("          <div><a target=\"_blank\" href=\"https://github.com/readium/readium-shared-js/tree/");t.b(t.v(t.d("sharedJs.sha",c,p,0)));t.b("\">readium-shared-js@");t.b(t.v(t.d("sharedJs.sha",c,p,0)));t.b("</a>");if(!t.s(t.d("sharedJs.clean",c,p,1),c,p,1,0,0,"")){t.b("<span class=\"local-changes-alert\">(with local changes)</span>");};t.b("</div>\r");t.b("\n" + i);t.b("        </div>\r");t.b("\n" + i);t.b("      </div>\r");t.b("\n" + i);t.b("    </div><!-- /.modal-content -->\r");t.b("\n" + i);t.b("  </div><!-- /.modal-dialog -->\r");t.b("\n" + i);t.b("</div><!-- /.modal -->");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!templates/reader-navbar.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"btn-group navbar-left\">\r");t.b("\n" + i);t.b("        <!-- <button type=\"button\" class=\"btn btn-default icon icon-show-hide\"></button>  -->\r");t.b("\n" + i);t.b("    <button id=\"aboutButt1\" tabindex=\"1\" type=\"button\" class=\"btn icon-logo\" data-toggle=\"modal\" data-target=\"#about-dialog\" title=\"");t.b(t.v(t.d("strings.about",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.about",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"icon-readium\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <button id=\"buttShowToolBar\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:1px;height=1px;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.ToolbarShow",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.ToolbarShow",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.ToolbarShow",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <button id=\"buttHideToolBar\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.ToolbarHide",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.ToolbarHide",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.ToolbarHide",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <button id=\"buttNightTheme\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.NightTheme",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.NightTheme",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.NightTheme",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <button id=\"buttRatePlus\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysRateIncrease",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysRateIncrease",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysRateIncrease",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <button id=\"buttRateMinus\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysRateDecrease",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysRateDecrease",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysRateDecrease",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <button id=\"buttVolumePlus\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeIncrease",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeIncrease",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysVolumeIncrease",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <button id=\"buttVolumeMinus\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeDecrease",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeDecrease",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysVolumeDecrease",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("<div class=\"btn-group navbar-right\">\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <div id=\"backgroundAudioTrack-div\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"backgroundAudioTrack-button-play\" type=\"button\" class=\"btn icon-play-audio-background\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_play_background",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.BackgroundAudioPlayPause",c,p,0)));t.b("]\"  aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_play_background",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.BackgroundAudioPlayPause",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.BackgroundAudioPlayPause",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-music\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"backgroundAudioTrack-button-pause\" type=\"button\" class=\"btn icon-pause-audio-background\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_pause_background",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.BackgroundAudioPlayPause",c,p,0)));t.b("]\"  aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_pause_background",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.BackgroundAudioPlayPause",c,p,0)));t.b("]\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-volume-up\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <!--Audioplayer Controls START-->\r");t.b("\n" + i);t.b("    <div id=\"audioplayer\">\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-collapse-audio\" type=\"button\" class=\"btn icon-collapse-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_collapse",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_collapse",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("]\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-open\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-expand-audio\" type=\"button\" class=\"btn icon-expand-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_expand",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_expand",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-save\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-previous-audio\" type=\"button\" class=\"btn icon-previous-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPrevious",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPrevious",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysPrevious",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-backward\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-play-audio\" type=\"button\" class=\"btn icon-play-audio\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_play",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPlayPause",c,p,0)));t.b("]\"  aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_play",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPlayPause",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysPlayPause",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-play\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-pause-audio\" type=\"button\" class=\"btn icon-pause-audio\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_pause",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPlayPause",c,p,0)));t.b("]\"  aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_pause",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPlayPause",c,p,0)));t.b("]\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-pause\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-next-audio\" type=\"button\" class=\"btn icon-next-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysNext",c,p,0)));t.b("]\" arial-label=\"");t.b(t.v(t.d("strings.i18n_audio_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysNext",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysNext",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-forward\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <div id=\"audioResponsive\">\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-audio-volume-mute\" type=\"button\" class=\"btn icon-audio-volume-mute\" title=\"");t.b(t.v(t.d("strings.i18n_audio_mute",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_mute",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-volume-up\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-audio-volume-unmute\" type=\"button\" class=\"btn icon-audio-volume-unmute\" title=\"");t.b(t.v(t.d("strings.i18n_audio_unmute",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_unmute",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("]\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-volume-off\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <input tabindex=\"1\" id=\"volume-range-slider\" type=\"range\" role=\"slider\" min=\"0\" aria-value-min=\"0\" aria-valuemin=\"0\" max=\"100\" aria-value-max=\"100\" aria-valuemax=\"100\" value=\"100\" aria-valuenow=\"100\" aria-value-now=\"100\" aria-valuetext=\"100%\" aria-value-text=\"100%\" title=\"");t.b(t.v(t.d("strings.i18n_audio_volume",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeDecrease",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeIncrease",c,p,0)));t.b("]\" arial-label=\"");t.b(t.v(t.d("strings.i18n_audio_volume",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeDecrease",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeIncrease",c,p,0)));t.b("]\" />\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" tabindex=\"1\" id=\"btn-touch-audio-enable\" type=\"button\" class=\"btn icon-touch-audio-enable\" title=\"");t.b(t.v(t.d("strings.i18n_audio_touch_enable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_touch_enable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("            <span id=\"icon-touch-off-hand\" class=\"glyphicon glyphicon-hand-up\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <span id=\"icon-touch-off\" class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-touch-audio-disable\" type=\"button\" class=\"btn icon-touch-audio-disable\" title=\"");t.b(t.v(t.d("strings.i18n_audio_touch_disable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_touch_disable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("            <span id=\"icon-touch-on-hand\" class=\"glyphicon glyphicon-hand-up\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <span id=\"icon-touch-on\" class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <div id=\"audioExpanded\" role=\"alert\">\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <input tabindex=\"1\" id=\"time-range-slider\" type=\"range\" role=\"slider\" min=\"0\" aria-value-min=\"0\" aria-valuemin=\"0\" max=\"100\" aria-value-max=\"100\" aria-valuemax=\"100\" value=\"0\" aria-valuenow=\"0\" aria-value-now=\"0\" aria-valuetext=\"0%\" aria-value-text=\"0%\" data-value=\"0\" title=\"");t.b(t.v(t.d("strings.i18n_audio_time",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_time",c,p,0)));t.b("\"  />\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-audio-rate\" type=\"button\" class=\"btn icon-rate-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_rate_reset",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysRateReset",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_rate_reset",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysRateReset",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysRateReset",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("                <span class=\"glyphicon glyphicon-play-circle\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <input tabindex=\"1\" id=\"rate-range-slider\" type=\"range\" role=\"slider\" min=\"0\" aria-value-min=\"0\" aria-valuemin=\"0\" max=\"4\" aria-value-max=\"4\" aria-valuemax=\"4\" value=\"1\" aria-valuenow=\"1\" aria-value-now=\"1\" aria-valuetext=\"1x\" aria-value-text=\"1x\" step=\"0.5\" title=\"");t.b(t.v(t.d("strings.i18n_audio_rate",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysRateDecrease",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.MediaOverlaysRateIncrease",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_rate",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysRateDecrease",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.MediaOverlaysRateIncrease",c,p,0)));t.b("]\" />\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <span aria-hidden=\"true\" tabindex=\"-1\" id=\"rate-range-slider-label\">1x</span>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <form action=\"\" id=\"mo-sync-form\">\r");t.b("\n" + i);t.b("                <input tabindex=\"1\" type=\"radio\" name=\"mo-sync\" value=\"default\" id=\"mo-sync-default\" class=\"mo-sync\" checked=\"checked\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_default",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_sync_default",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"> </input>\r");t.b("\n" + i);t.b("                <label tabindex=\"1\" for=\"mo-sync-default\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_default",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"><span aria-hidden=\"true\">&#8855;</span></label>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                <input tabindex=\"1\" type=\"radio\" name=\"mo-sync\" value=\"word\" id=\"mo-sync-word\" class=\"mo-sync\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_word",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_sync_word",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"> </input>\r");t.b("\n" + i);t.b("                <label tabindex=\"1\" for=\"mo-sync-word\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_word",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"><span aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_audio_sync_word",c,p,0)));t.b("</span></label>\r");t.b("\n" + i);t.b("                \r");t.b("\n" + i);t.b("                <input tabindex=\"1\" type=\"radio\" name=\"mo-sync\" value=\"sentence\" id=\"mo-sync-sentence\" class=\"mo-sync\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_sentence",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_sync_sentence",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"> </input>\r");t.b("\n" + i);t.b("                <label tabindex=\"1\" for=\"mo-sync-sentence\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_sentence",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"><span aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_audio_sync_sentence",c,p,0)));t.b("</span></label>\r");t.b("\n" + i);t.b("                \r");t.b("\n" + i);t.b("                <input tabindex=\"1\" type=\"radio\" name=\"mo-sync\" value=\"paragraph\" id=\"mo-sync-paragraph\" class=\"mo-sync\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_paragraph",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_sync_paragraph",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"> </input>\r");t.b("\n" + i);t.b("                <label tabindex=\"1\" for=\"mo-sync-paragraph\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_paragraph",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"><span aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_audio_sync_paragraph",c,p,0)));t.b("</span></label>\r");t.b("\n" + i);t.b("            </form>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <div id=\"audio-block\">\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <div id=\"mo-highlighters\">\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-0\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": ");t.b(t.v(t.d("strings.i18n_audio_highlight_default",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": ");t.b(t.v(t.d("strings.i18n_audio_highlight_default",c,p,0)));t.b("\" aria-selected=\"true\" data-mohighlight=\"0\" >\r");t.b("\n" + i);t.b("                    ");t.b(t.v(t.d("strings.i18n_audio_highlight_default",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-1\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #1\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #1\" data-mohighlight=\"1\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-2\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #2\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #2\" data-mohighlight=\"2\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-3\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #3\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #3\" data-mohighlight=\"3\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-4\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #4\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #4\" data-mohighlight=\"4\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-5\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #5\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #5\" data-mohighlight=\"5\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-6\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #6\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #6\" data-mohighlight=\"6\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-playback-scroll-enable\" type=\"button\" class=\"btn icon-playback-scroll-enable\" title=\"");t.b(t.v(t.d("strings.i18n_playback_scroll_enable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_playback_scroll_enable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-playback-scroll-off\" class=\"glyphicon glyphicon-sort-by-attributes\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-playback-scroll-disable\" type=\"button\" class=\"btn icon-playback-scroll-disable\" title=\"");t.b(t.v(t.d("strings.i18n_playback_scroll_disable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_playback_scroll_disable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-playback-scroll-on\" class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-auto-page-turn-enable\" type=\"button\" class=\"btn icon-auto-page-turn-enable\" title=\"");t.b(t.v(t.d("strings.i18n_auto_page_turn_enable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_auto_page_turn_enable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-auto-page-turn-off\" class=\"glyphicon glyphicon-sound-stereo\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-auto-page-turn-disable\" type=\"button\" class=\"btn icon-auto-page-turn-disable\" title=\"");t.b(t.v(t.d("strings.i18n_auto_page_turn_disable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_auto_page_turn_disable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-auto-page-turn-on\" class=\"glyphicon glyphicon-sound-dolby\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-skip-audio-enable\" type=\"button\" class=\"btn icon-skip-audio-enable\" title=\"");t.b(t.v(t.d("strings.i18n_audio_skip_enable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_skip_enable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-skip-off\" class=\"glyphicon glyphicon-remove-circle\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-skip-audio-disable\" type=\"button\" class=\"btn icon-skip-audio-disable\" title=\"");t.b(t.v(t.d("strings.i18n_audio_skip_disable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_skip_disable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-skip-on\" class=\"glyphicon glyphicon-ok-circle\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-esc-audio\" type=\"button\" class=\"btn icon-esc-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_esc",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysEscape",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_esc",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysEscape",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysEscape",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("                <span class=\"glyphicon glyphicon-eject\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <!-- div class=\"checkbox\">\r");t.b("\n" + i);t.b("              <label>\r");t.b("\n" + i);t.b("                <input type=\"checkbox\" value=\"false\"> Skip\r");t.b("\n" + i);t.b("              </label>\r");t.b("\n" + i);t.b("            </div -->\r");t.b("\n" + i);t.b("        </div>\r");t.b("\n" + i);t.b("    </div> \r");t.b("\n" + i);t.b("    <!--Audioplayer Controls END-->\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <div class=\"zoom-wrapper dropdown\" style=\"display:none\">\r");t.b("\n" + i);t.b("        <a tabindex=\"1\" href=\"#\" data-toggle=\"dropdown\"><input tabindex=\"1\" type=\"text\" value=\"100%\" disabled/><span class=\"caret\"></span></a>\r");t.b("\n" + i);t.b("        <ul id=\"zoom-menu\" class=\"dropdown-menu\" role=\"menu\">\r");t.b("\n" + i);t.b("            <li id=\"zoom-custom\"><a href=\"#\" tabindex=\"1\">Custom <span class=\"glyphicon glyphicon-ok\"></span></a></li>\r");t.b("\n" + i);t.b("            <li id=\"zoom-fit-width\"><a href=\"#\" tabindex=\"1\">Fit Width <span class=\"glyphicon glyphicon-ok\"></span></a></li>\r");t.b("\n" + i);t.b("            <li id=\"zoom-fit-screen\" class=\"active-zoom\"><a href=\"#\" tabindex=\"1\">Fit Screen <span class=\"glyphicon glyphicon-ok\"></span></a></li>\r");t.b("\n" + i);t.b("        </ul>\r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("    <button tabindex=\"1\" type=\"button\" class=\"btn icon-library\" title=\"");t.b(t.v(t.d("strings.view_library",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SwitchToLibrary",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.view_library",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SwitchToLibrary",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.SwitchToLibrary",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-folder-open\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    <button tabindex=\"1\" type=\"button\" class=\"btn icon-annotations\" title=\"");t.b(t.v(t.d("strings.highlight_selection",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.highlight_selection",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-edit\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    <button id=\"tocButt\" tabindex=\"1\" tabindex=\"1\" type=\"button\" class=\"btn icon-toc\" title=\"");t.b(t.v(t.d("strings.toc",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.TocShowHideToggle",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.toc",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.TocShowHideToggle",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.TocShowHideToggle",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-list\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    <button id=\"settbutt1\" tabindex=\"1\" type=\"button\" class=\"btn icon-settings\" data-toggle=\"modal\" data-target=\"#settings-dialog\" title=\"");t.b(t.v(t.d("strings.settings",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.ShowSettingsModal",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.settings",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.ShowSettingsModal",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.ShowSettingsModal",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-cog\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <button tabindex=\"1\" id=\"buttFullScreenToggle\" type=\"button\" class=\"btn icon-full-screen\" title=\"");t.b(t.v(t.d("strings.enter_fullscreen",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.FullScreenToggle",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.enter_fullscreen",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.FullScreenToggle",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.FullScreenToggle",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-resize-full\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <!-- <button type=\"button\" class=\"btn btn-default icon icon-bookmark\"></button>-->\r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("\r");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!templates/reader-body.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div id=\"readium-toc-body\"\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.toc",c,p,0)));t.b("\"\r");t.b("\n" + i);t.b("role=\"navigation\"\r");t.b("\n" + i);t.b(">\r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("<div id=\"reading-area\" role=\"main\">  \r");t.b("\n" + i);t.b("  <div id=\"epub-reader-container\">\r");t.b("\n" + i);t.b("    <div id=\"epub-reader-frame\">\r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("  </div>\r");t.b("\n" + i);t.b("  \r");t.b("\n" + i);t.b("  <div id=\"readium-page-btns\" role=\"region\" aria-label=\"");t.b(t.v(t.d("strings.i18n_page_navigation",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("  <!-- page left/right buttons inserted here when EPUB is loaded (page progression direction) -->\r");t.b("\n" + i);t.b("  </div>\r");t.b("\n" + i);t.b("  \r");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!templates/reader-body-page-btns.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<!-- Left page -->\r");t.b("\n" + i);t.b("<button tabindex=\"0\" id=\"left-page-btn\" class=\"page-switch-overlay-icon\" type=\"button\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);if(t.s(t.f("pageProgressionDirectionIsRTL",c,p,1),c,p,0,144,402,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("title=\"");t.b(t.v(t.d("strings.i18n_page_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PagePrevious",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PagePreviousAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.i18n_page_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PagePrevious",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PagePreviousAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.PagePreviousAlt",c,p,0)));t.b("\"\r");t.b("\n" + i);});c.pop();}t.b("\r");t.b("\n" + i);if(!t.s(t.f("pageProgressionDirectionIsRTL",c,p,1),c,p,1,0,0,"")){t.b("title=\"");t.b(t.v(t.d("strings.i18n_page_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PagePrevious",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PagePreviousAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.i18n_page_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PagePrevious",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PagePreviousAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.PagePreviousAlt",c,p,0)));t.b("\"\r");t.b("\n" + i);};t.b("\r");t.b("\n" + i);t.b(">\r");t.b("\n" + i);t.b("<!-- img aria-hidden=\"true\" src=\"images/pagination1.svg\" -->\r");t.b("\n" + i);t.b("<span class=\"glyphicon glyphicon-chevron-left\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("</button>\r");t.b("\n" + i);t.b("  \r");t.b("\n" + i);t.b("<!-- Right page -->\r");t.b("\n" + i);t.b("<button tabindex=\"0\" id=\"right-page-btn\" class=\"page-switch-overlay-icon\" type=\"button\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);if(t.s(t.f("pageProgressionDirectionIsRTL",c,p,1),c,p,0,1079,1325,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("title=\"");t.b(t.v(t.d("strings.i18n_page_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PageNext",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PageNextAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.i18n_page_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PageNext",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PageNextAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.PageNextAlt",c,p,0)));t.b("\"\r");t.b("\n" + i);});c.pop();}t.b("\r");t.b("\n" + i);if(!t.s(t.f("pageProgressionDirectionIsRTL",c,p,1),c,p,1,0,0,"")){t.b("title=\"");t.b(t.v(t.d("strings.i18n_page_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PageNext",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PageNextAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.i18n_page_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PageNext",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PageNextAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.PageNextAlt",c,p,0)));t.b("\"\r");t.b("\n" + i);};t.b("\r");t.b("\n" + i);t.b(">\r");t.b("\n" + i);t.b("<!-- img aria-hidden=\"true\" src=\"images/pagination1.svg\" -->\r");t.b("\n" + i);t.b("<span class=\"glyphicon glyphicon-chevron-right\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("</button>\r");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});

define('analytics/Analytics',[],function(){
	return{
		trackView : function(){},
		sendEvent : function(){}
	}
});
/*!
* screenfull
* v2.0.0 - 2014-12-22
* (c) Sindre Sorhus; MIT License
*/
(function () {
	'use strict';

	var isCommonjs = typeof module !== 'undefined' && module.exports;
	var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;

	var fn = (function () {
		var val;
		var valLength;

		var fnMap = [
			[
				'requestFullscreen',
				'exitFullscreen',
				'fullscreenElement',
				'fullscreenEnabled',
				'fullscreenchange',
				'fullscreenerror'
			],
			// new WebKit
			[
				'webkitRequestFullscreen',
				'webkitExitFullscreen',
				'webkitFullscreenElement',
				'webkitFullscreenEnabled',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			// old WebKit (Safari 5.1)
			[
				'webkitRequestFullScreen',
				'webkitCancelFullScreen',
				'webkitCurrentFullScreenElement',
				'webkitCancelFullScreen',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			[
				'mozRequestFullScreen',
				'mozCancelFullScreen',
				'mozFullScreenElement',
				'mozFullScreenEnabled',
				'mozfullscreenchange',
				'mozfullscreenerror'
			],
			[
				'msRequestFullscreen',
				'msExitFullscreen',
				'msFullscreenElement',
				'msFullscreenEnabled',
				'MSFullscreenChange',
				'MSFullscreenError'
			]
		];

		var i = 0;
		var l = fnMap.length;
		var ret = {};

		for (; i < l; i++) {
			val = fnMap[i];
			if (val && val[1] in document) {
				for (i = 0, valLength = val.length; i < valLength; i++) {
					ret[fnMap[0][i]] = val[i];
				}
				return ret;
			}
		}

		return false;
	})();

	var screenfull = {
		request: function (elem) {
			var request = fn.requestFullscreen;

			elem = elem || document.documentElement;

			// Work around Safari 5.1 bug: reports support for
			// keyboard in fullscreen even though it doesn't.
			// Browser sniffing, since the alternative with
			// setTimeout is even worse.
			if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {
				elem[request]();
			} else {
				elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
			}
		},
		exit: function () {
			document[fn.exitFullscreen]();
		},
		toggle: function (elem) {
			if (this.isFullscreen) {
				this.exit();
			} else {
				this.request(elem);
			}
		},
		raw: fn
	};

	if (!fn) {
		if (isCommonjs) {
			module.exports = false;
		} else {
			window.screenfull = false;
		}

		return;
	}

	Object.defineProperties(screenfull, {
		isFullscreen: {
			get: function () {
				return !!document[fn.fullscreenElement];
			}
		},
		element: {
			enumerable: true,
			get: function () {
				return document[fn.fullscreenElement];
			}
		},
		enabled: {
			enumerable: true,
			get: function () {
				// Coerce to boolean in case of old WebKit
				return !!document[fn.fullscreenEnabled];
			}
		}
	});

	if (isCommonjs) {
		module.exports = screenfull;
	} else {
		window.screenfull = screenfull;
	}
})();

define("screenfull", (function (global) {
    return function () {
        var ret, fn;
        return ret || global.screenfull;
    };
}(this)));


define('EpubReaderMediaOverlays',['module','jquery', 'underscore', 'bootstrap', 'Readium', 'Spinner', 'storage/Settings', 'i18n/Strings', 'Dialogs', 'Keyboard'], 
        function (module, $, _, bootstrap, Readium, spinner, Settings, Strings, Dialogs, Keyboard) {

    var init = function(readium) {
        
        readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData) {
            // That's after mediaOverlayPlayer.onPageChanged()

            if (readium.reader.isMediaOverlayAvailable()) {
                $('#audioplayer').show();
            }
            
            if (!pageChangeData.spineItem) return;
            
            var smil = readium.reader.package().media_overlay.getSmilBySpineItem(pageChangeData.spineItem);

            var atLeastOneIsEnabled = false;

            var $moSyncWord = $('#mo-sync-word');
            if (!smil || !smil.hasSync("word"))
            {
                $moSyncWord.attr('disabled', "disabled");
            }
            else
            {
                atLeastOneIsEnabled = true;
                $moSyncWord.removeAttr('disabled');
            }
            
            var $moSyncSentence = $('#mo-sync-sentence');
            if (!smil || !smil.hasSync("sentence"))
            {
                $moSyncSentence.attr('disabled', "disabled");
            }
            else
            {
                atLeastOneIsEnabled = true;
                $moSyncSentence.removeAttr('disabled');
            }

            var $moSyncParagraph = $('#mo-sync-paragraph');
            if (!smil || !smil.hasSync("paragraph"))
            {
                $moSyncParagraph.attr('disabled', "disabled");
            }
            else
            {
                atLeastOneIsEnabled = true;
                $moSyncParagraph.removeAttr('disabled');
            }
            
            var $moSyncDefault = $('#mo-sync-default');
            if (!atLeastOneIsEnabled)
            {
                $moSyncDefault.attr('disabled', "disabled");
            }
            else
            {
                $moSyncDefault.removeAttr('disabled');
            }
        });
        
        var $audioPlayer = $('#audioplayer');

        Settings.get('reader', function(json)
        {
            if (!json)
            {
                json = {};
                
                var settings = readium.reader.viewerSettings();
                
                json.mediaOverlaysSkipSkippables = settings.mediaOverlaysSkipSkippables;
                json.mediaOverlaysAutomaticPageTurn = settings.mediaOverlaysAutomaticPageTurn;
                json.mediaOverlaysEnableClick = settings.mediaOverlaysEnableClick;
                json.mediaOverlaysPreservePlaybackWhenScroll = settings.mediaOverlaysPreservePlaybackWhenScroll;
                
                Settings.put('reader', json);
            }
            
            if (json.mediaOverlaysSkipSkippables) // excludes typeof json.mediaOverlaysSkipSkippables === "undefined", so the default is to disable skippability
            {
                $audioPlayer.addClass('skip');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysSkipSkippables: true
                });
            }
            else
            {
                $audioPlayer.removeClass('skip');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysSkipSkippables: false
                });
            }

            if (json.mediaOverlaysPreservePlaybackWhenScroll)
            {
                $audioPlayer.addClass('playScroll');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysPreservePlaybackWhenScroll: true
                });
            }
            else
            {
                $audioPlayer.removeClass('playScroll');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysPreservePlaybackWhenScroll: false
                });
            }

            if (json.mediaOverlaysAutomaticPageTurn)
            {
                $audioPlayer.addClass('autoPageTurn');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysAutomaticPageTurn: true
                });
            }
            else
            {
                $audioPlayer.removeClass('autoPageTurn');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysAutomaticPageTurn: false
                });
            }
            
            if (json.mediaOverlaysEnableClick)
            {
                $audioPlayer.removeClass('no-touch');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysEnableClick: true
                });
            }
            else
            {
                $audioPlayer.addClass('no-touch');
                
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysEnableClick: false
                });
            }
        });
        
        var $moSyncDefault = $('#mo-sync-default');
        $moSyncDefault.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: ""
            });
            
            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        var $moSyncWord = $('#mo-sync-word');
        $moSyncWord.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: "word"
            });
            
            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        var $moSyncSentence = $('#mo-sync-sentence');
        $moSyncSentence.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: "sentence"
            });
            
            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        var $moSyncParagraph = $('#mo-sync-paragraph');
        $moSyncParagraph.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: "paragraph"
            });
            
            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        
        
        var $highlighterButts = $('.btn-mo-highlighter');
        $highlighterButts.on("click", function () {
            $highlighterButts.attr("aria-selected", "false");
            $(this).attr("aria-selected", "true");
            
            var index = $(this).attr("data-mohighlight");

            readium.reader.setStyles([
                {
                    selector: ".mo-active-default",
                    declarations: undefined
                }
            ], true);
            
            if (index === "1")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "yellow !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important",
                            "box-shadow": "0px 0px 0.4em #333333 !important"
                        }
                    }
                ], true);
            }
            else if (index === "2")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "black !important",
                            "color": "white !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "3")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "orange !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "4")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "blue !important",
                            "color": "white !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "5")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "magenta !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "6")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "#00FF00 !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
        });
        
        Keyboard.on(Keyboard.MediaOverlaysEscape, 'reader', readium.reader.escapeMediaOverlay);
        
        var $escAudioBtn = $("#btn-esc-audio");
        $escAudioBtn.on("click", readium.reader.escapeMediaOverlay);
        
        var $previousAudioBtn = $("#btn-previous-audio");
        var $nextAudioBtn = $("#btn-next-audio");
        
        Keyboard.on(Keyboard.MediaOverlaysPlayPause, 'reader', readium.reader.toggleMediaOverlay);
        //Keyboard.on(Keyboard.MediaOverlaysPlayPauseAlt, 'reader', readium.reader.toggleMediaOverlay);
        
        var $playAudioBtn = $("#btn-play-audio");
        var $pauseAudioBtn = $("#btn-pause-audio");
        
        $playAudioBtn.on("click", function () {
            //readium.reader[$(this).hasClass('pause-audio') ? 'pauseMediaOverlay' : 'playMediaOverlay']();
            //readium.reader.toggleMediaOverlay();
            var wasFocused = document.activeElement === $playAudioBtn[0];
            readium.reader.playMediaOverlay();
            
            $playAudioBtn.removeAttr("accesskey");
            $pauseAudioBtn.attr("accesskey", Keyboard.MediaOverlaysPlayPause);
            
            if (wasFocused) setTimeout(function(){ $pauseAudioBtn[0].focus(); }, 50);
        });
        
        $pauseAudioBtn.on("click", function () {
            var wasFocused = document.activeElement === $pauseAudioBtn[0];
            readium.reader.pauseMediaOverlay();
            
            $pauseAudioBtn.removeAttr("accesskey");
            $playAudioBtn.attr("accesskey", Keyboard.MediaOverlaysPlayPause);
            
            if (wasFocused) setTimeout(function(){ $playAudioBtn[0].focus(); }, 50);
        });
        
        
        var $expandAudioBtn = $("#btn-expand-audio");
        var $collapseAudioBtn = $("#btn-collapse-audio");

        var updateAudioExpand = function(expand)
        {
            if (expand)
            {
                $audioPlayer.addClass('expanded-audio');
                
                $expandAudioBtn.removeAttr("accesskey");
                $collapseAudioBtn.attr("accesskey", Keyboard.MediaOverlaysAdvancedPanelShowHide);
            }
            else
            {
                $audioPlayer.removeClass('expanded-audio');
                
                $collapseAudioBtn.removeAttr("accesskey");
                $expandAudioBtn.attr("accesskey", Keyboard.MediaOverlaysAdvancedPanelShowHide);
            }
        };
        
        Keyboard.on(Keyboard.MediaOverlaysAdvancedPanelShowHide, 'reader', function(){
            var toFocus = undefined;
            if ($audioPlayer.hasClass('expanded-audio'))
            {
                updateAudioExpand(false);
                toFocus = $expandAudioBtn[0];
            }
            else
            {
                updateAudioExpand(true);
                toFocus = $collapseAudioBtn[0];
            }

            $(document.body).removeClass('hide-ui');
            setTimeout(function(){ toFocus.focus(); }, 50);
        });
        
        $expandAudioBtn.on("click", function() {
            var wasFocused = document.activeElement === $expandAudioBtn[0];
            updateAudioExpand(true);
            if (wasFocused) setTimeout(function(){ $collapseAudioBtn[0].focus(); }, 50);
        });
        
        $collapseAudioBtn.on("click", function() {
            var wasFocused = document.activeElement === $collapseAudioBtn[0];
            updateAudioExpand(false);
            if (wasFocused) setTimeout(function(){ $expandAudioBtn[0].focus(); }, 50);
        });

        var $changeTimeControl = $('#time-range-slider');
        
        var debouncedTimeRangeSliderChange = _.debounce(
            function() {
        
                inDebounce = false;
                
                var percent = $changeTimeControl.val();

                var package = readium.reader.package();
                if (!package) return;
                if (!package.media_overlay) return;

                var par = {par: undefined};
                var smilData = {smilData: undefined};
                var milliseconds = {milliseconds: undefined};
        
                package.media_overlay.percentToPosition(percent, smilData, par, milliseconds);
        
                if (!par.par || !par.par.text || !smilData.smilData)
                {
                    return;
                }
        
                var smilSrc = smilData.smilData.href;
        
                var offsetS = milliseconds.milliseconds / 1000.0;
        
                readium.reader.mediaOverlaysOpenContentUrl(par.par.text.src, smilSrc, offsetS);
            }
        , 800);
        
        var updateSliderLabels = function($slider, val, txt)
        {
            $slider.attr("aria-valuenow", val+"");
            $slider.attr("aria-value-now", val+"");
            
            $slider.attr("aria-valuetext", txt+"");
            $slider.attr("aria-value-text", txt+"");
        };
        
        $changeTimeControl.on("change",
        function() {
            
            var percent = $changeTimeControl.val();
            percent = Math.round(percent);
            
            $changeTimeControl.attr("data-value", percent);
            updateSliderLabels($changeTimeControl, percent, percent + "%");
            
            if (readium.reader.isPlayingMediaOverlay())
            {
                readium.reader.pauseMediaOverlay();
            }
            debouncedTimeRangeSliderChange();
        }
        );
        
        readium.reader.on(ReadiumSDK.Events.MEDIA_OVERLAY_STATUS_CHANGED, function (value) {

            //var $audioPlayerControls = $('#audioplayer button, #audioplayer input:not(.mo-sync)');

            var percent = 0;

            var isPlaying = 'isPlaying' in value
                ? value.isPlaying   // for all the other events
                : true;             // for events raised by positionChanged, as `isPlaying` flag isn't even set

            var wasFocused = document.activeElement === $playAudioBtn[0] || document.activeElement === $pauseAudioBtn[0];

            if (isPlaying)
            {
                $playAudioBtn.removeAttr("accesskey");
                $pauseAudioBtn.attr("accesskey", Keyboard.MediaOverlaysPlayPause);
            }
            else
            {
                $pauseAudioBtn.removeAttr("accesskey");
                $playAudioBtn.attr("accesskey", Keyboard.MediaOverlaysPlayPause);
            }

            $audioPlayer.toggleClass('isPlaying', isPlaying);

            if (wasFocused) setTimeout(function(){ (isPlaying ? $pauseAudioBtn[0] : $playAudioBtn[0]).focus(); }, 50);
            
            percent = -1; // to prevent flickering slider position (pause callback is raised between each audio phrase!)

            // if (readium.reader.isMediaOverlayAvailable()) {
            //     $audioPlayer.show();
            //     //$audioPlayerControls.attr('disabled', false);
            //     
            // } else {
            //     //$audioPlayerControls.attr('disabled', true);
            // }

            if ((typeof value.playPosition !== "undefined") && (typeof value.smilIndex !== "undefined") && (typeof value.parIndex !== "undefined"))
            {
                var package = readium.reader.package();
                
                var playPositionMS = value.playPosition * 1000;
                percent = package.media_overlay.positionToPercent(value.smilIndex, value.parIndex, playPositionMS);

                if (percent < 0)
                {
                    percent = 0;
                }
            }

            if (percent >= 0)
            {
                $changeTimeControl.val(percent);
                percent = Math.round(percent);
                $changeTimeControl.attr("data-value", percent);
                updateSliderLabels($changeTimeControl, percent, percent + "%");
            }
        });
        
        var $buttondPreservePlaybackWhenScrollDisable = $('#btn-playback-scroll-disable');
        var $buttonPreservePlaybackWhenScrollEnable = $('#btn-playback-scroll-enable');
        
        $buttondPreservePlaybackWhenScrollDisable.on("click", function() {

            var wasFocused = document.activeElement === $buttondPreservePlaybackWhenScrollDisable[0];
            
            $audioPlayer.removeClass('playScroll');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysPreservePlaybackWhenScroll: false
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysPreservePlaybackWhenScroll = false;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonPreservePlaybackWhenScrollEnable[0].focus(); }, 50);
        });

        $buttonPreservePlaybackWhenScrollEnable.on("click", function() {

            var wasFocused = document.activeElement === $buttonPreservePlaybackWhenScrollEnable[0];
            
            $audioPlayer.addClass('playScroll');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysPreservePlaybackWhenScroll: true
            });
            
            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysPreservePlaybackWhenScroll = true;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttondPreservePlaybackWhenScrollDisable[0].focus(); }, 50);
        });

        var $buttonAutoPageTurnDisable = $('#btn-auto-page-turn-disable');
        var $buttonAutoPageTurnEnable = $('#btn-auto-page-turn-enable');
        
        $buttonAutoPageTurnDisable.on("click", function() {

            var wasFocused = document.activeElement === $buttonAutoPageTurnDisable[0];
            
            $audioPlayer.removeClass('autoPageTurn');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysAutomaticPageTurn: false
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysAutomaticPageTurn = false;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonAutoPageTurnEnable[0].focus(); }, 50);
        });

        $buttonAutoPageTurnEnable.on("click", function() {

            var wasFocused = document.activeElement === $buttonAutoPageTurnEnable[0];
            
            $audioPlayer.addClass('autoPageTurn');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysAutomaticPageTurn: true
            });
            
            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysAutomaticPageTurn = true;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonAutoPageTurnDisable[0].focus(); }, 50);
        });
        

        var $buttonSkipDisable = $('#btn-skip-audio-disable');
        var $buttonSkipEnable = $('#btn-skip-audio-enable');
        
        $buttonSkipDisable.on("click", function() {

            var wasFocused = document.activeElement === $buttonSkipDisable[0];
            
            $audioPlayer.removeClass('skip');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSkipSkippables: false
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysSkipSkippables = false;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonSkipEnable[0].focus(); }, 50);
        });

        $buttonSkipEnable.on("click", function() {

            var wasFocused = document.activeElement === $buttonSkipEnable[0];
            
            $audioPlayer.addClass('skip');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSkipSkippables: true
            });
            
            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysSkipSkippables = true;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonSkipDisable[0].focus(); }, 50);
        });
        
        var $buttonTouchEnable = $('#btn-touch-audio-enable');
        var $buttonTouchDisable = $('#btn-touch-audio-disable');
        
        $buttonTouchEnable.on("click", function() {
            
            var wasFocused = document.activeElement === $buttonTouchEnable[0];
            
            $audioPlayer.removeClass('no-touch');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysEnableClick: true
            });
            
            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysEnableClick = true;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonTouchDisable[0].focus(); }, 50);
        });
        
        $buttonTouchDisable.on("click", function() {
            
            var wasFocused = document.activeElement === $buttonTouchDisable[0];
            
            $audioPlayer.addClass('no-touch');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysEnableClick: false
            });
            
            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysEnableClick = false;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonTouchEnable[0].focus(); }, 50);
        });
        
        var $changeRateControl = $('#rate-range-slider');
        var $changeRateControl_label = $('#rate-range-slider-label');
        
        var changeRate = function(minus)
        {
            var rateMin = parseFloat($changeRateControl.attr("min"));
            var rateMax = parseFloat($changeRateControl.attr("max"));
            var rateStep = parseFloat($changeRateControl.attr("step"));
            var rateVal = parseFloat($changeRateControl.val());

            rateVal += (minus ? (-rateStep) : rateStep);

            if (rateVal > rateMax) rateVal = rateMax;
            if (rateVal < rateMin) rateVal = rateMin;
            
            var txt = ((rateVal === 0 ? "~0" : ""+rateVal) + "x");
            
            updateSliderLabels($changeRateControl, rateVal, txt);
            
            $changeRateControl_label[0].textContent = txt;
            
            //readium.reader.setRateMediaOverlay(rateVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: rateVal
            });
            
            $changeRateControl.val(""+rateVal);
        };
        
        $("#buttRatePlus").on("click", function(){
            changeRate(false);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        Keyboard.on(Keyboard.MediaOverlaysRateIncrease, 'reader', function(){        
            changeRate(false);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        
        $("#buttRateMinus").on("click", function(){
            changeRate(true);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        Keyboard.on(Keyboard.MediaOverlaysRateDecrease, 'reader', function(){
            changeRate(true);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        
        // Keyboard.on(Keyboard.MediaOverlaysRateIncreaseAlt, 'reader', function(){        
        //     changeRate(false);
        //     //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        // });
        // 
        // Keyboard.on(Keyboard.MediaOverlaysRateDecreaseAlt, 'reader', function(){
        //     changeRate(true);
        //     //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        // });
        
        $changeRateControl.on("change", function() {
            var rateVal = $(this).val();
            var txt = ((rateVal === '0' ? "~0" : rateVal) + "x");
            
            updateSliderLabels($(this), rateVal, txt);

            $changeRateControl_label[0].textContent = txt;
            
            //readium.reader.setRateMediaOverlay(rateVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: rateVal
            });
        });
        
        var resetRate = function() {
            $changeRateControl.val(1);

            updateSliderLabels($changeRateControl, "1", "1x");

            $changeRateControl_label[0].textContent = "1x";
            
            //readium.reader.setRateMediaOverlay(1);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: 1
            });
        };

        Keyboard.on(Keyboard.MediaOverlaysRateReset, 'reader', resetRate);
        
        var $rateButton = $('#btn-audio-rate');
        $rateButton.on("click", resetRate);
        
        var $changeVolumeControl = $('#volume-range-slider');
        
        var changeVolume = function(minus)
        {
            var volumeVal = parseInt($changeVolumeControl.val());

            volumeVal += (minus ? (-20) : 20);

            if (volumeVal < 0) volumeVal = 0;
            if (volumeVal > 100) volumeVal = 100;

            //readium.reader.setVolumeMediaOverlay(volumeVal / 100);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });
            
            $changeVolumeControl.val(""+volumeVal);

            updateSliderLabels($changeVolumeControl, volumeVal, volumeVal + "%");
            
            if (volumeVal === 0) {
                $audioPlayer.addClass('no-volume');
            } else {
                $audioPlayer.removeClass('no-volume');
            }
        };
        
        $("#buttVolumePlus").on("click", function(){
            changeVolume(false);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        Keyboard.on(Keyboard.MediaOverlaysVolumeIncrease, 'reader', function(){
            changeVolume(false);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        
        $("#buttVolumeMinus").on("click", function(){
            changeVolume(true);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        Keyboard.on(Keyboard.MediaOverlaysVolumeDecrease, 'reader', function(){
            changeVolume(true);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        
        // Keyboard.on(Keyboard.MediaOverlaysVolumeIncreaseAlt, 'reader', function(){
        //     changeVolume(false);
        //     //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        // });
        
        // Keyboard.on(Keyboard.MediaOverlaysVolumeDecreaseAlt, 'reader', function(){
        //     changeVolume(true);
        //     //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        // });
        
        $changeVolumeControl.on("change", function() {
            var volumeVal = $(this).val();

            //readium.reader.setVolumeMediaOverlay(volumeVal / 100);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });

            updateSliderLabels($changeVolumeControl, volumeVal, volumeVal + "%");
            
            if (volumeVal === '0') {
                $audioPlayer.addClass('no-volume');
            } else {
                $audioPlayer.removeClass('no-volume');
            }
        });
                
        $volumeButtonMute = $('#btn-audio-volume-mute');
        $volumeButtonUnMute = $('#btn-audio-volume-unmute');
        
        var _lastVolumeBeforeMute = '0';
        
        var muteVolume = function(){

            _lastVolumeBeforeMute = $changeVolumeControl.val();

            //readium.reader.setVolumeMediaOverlay(volumeVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: 0
            });
            
            $changeVolumeControl.val(0);

            updateSliderLabels($changeVolumeControl, 0, 0 + "%");
            
            $volumeButtonMute.removeAttr("accesskey");
            $volumeButtonUnMute.attr("accesskey", Keyboard.MediaOverlaysVolumeMuteToggle);
            
            $audioPlayer.addClass('no-volume');
        };
        
        var unMuteVolume = function(){

            //var currentVolume = $changeVolumeControl.val();
            var volumeVal = _lastVolumeBeforeMute === '0' ? '100' : _lastVolumeBeforeMute;

            //readium.reader.setVolumeMediaOverlay(volumeVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });
            
            $changeVolumeControl.val(volumeVal);

            updateSliderLabels($changeVolumeControl, volumeVal, volumeVal + "%");
            
            $volumeButtonUnMute.removeAttr("accesskey");
            $volumeButtonMute.attr("accesskey", Keyboard.MediaOverlaysVolumeMuteToggle);

            $audioPlayer.removeClass('no-volume');
        };

        Keyboard.on(Keyboard.MediaOverlaysVolumeMuteToggle, 'reader', function(){
            ($audioPlayer.hasClass('no-volume') ? unMuteVolume : muteVolume)();
        });
        
        $volumeButtonMute.on("click", function() {
            
            var wasFocused = document.activeElement === $volumeButtonMute[0];
                
            muteVolume();
                
            if (wasFocused) setTimeout(function(){ $volumeButtonUnMute[0].focus(); }, 50);
        });
        
        $volumeButtonUnMute.on("click", function() {
            
            var wasFocused = document.activeElement === $volumeButtonUnMute[0];
            
            unMuteVolume();
            
            if (wasFocused) setTimeout(function(){ $volumeButtonMute[0].focus(); }, 50);
        });
        
        Keyboard.on(Keyboard.MediaOverlaysPrevious, 'reader', readium.reader.previousMediaOverlay);
        
        $previousAudioBtn.on("click", readium.reader.previousMediaOverlay);
        
        Keyboard.on(Keyboard.MediaOverlaysNext, 'reader', readium.reader.nextMediaOverlay);
        
        $nextAudioBtn.on("click", readium.reader.nextMediaOverlay);
    };

    return {
        init : init
    };
});


define('EpubReaderBackgroundAudioTrack',['module','jquery', 'bootstrap', 'Readium', 'Spinner', 'storage/Settings', 'i18n/Strings', 'Dialogs', 'Keyboard'], 
        function (module, $, bootstrap, Readium, spinner, Settings, Strings, Dialogs, Keyboard) {

    var init = function(readium) {

        if (!readium.reader.backgroundAudioTrackManager) return; // safety (out-of-date readium-shared-js?)

        var $audioTrackDiv = $("#backgroundAudioTrack-div");
    
        var $playAudioTrackBtn = $("#backgroundAudioTrack-button-play");
        var $pauseAudioTrackBtn = $("#backgroundAudioTrack-button-pause");

        readium.reader.backgroundAudioTrackManager.setCallback_PlayPause(function(doPlay)
            {
                if (doPlay)
                {
                    $audioTrackDiv.addClass('isPlaying');

                    $playAudioTrackBtn.removeAttr("accesskey");
                    $pauseAudioTrackBtn.attr("accesskey", Keyboard.BackgroundAudioPlayPause);
                }
                else
                {
                    $audioTrackDiv.removeClass('isPlaying');

                    $pauseAudioTrackBtn.removeAttr("accesskey");
                    $playAudioTrackBtn.attr("accesskey", Keyboard.BackgroundAudioPlayPause);
                }
            }
        );

        readium.reader.backgroundAudioTrackManager.setCallback_IsAvailable(function(yes)
            {
                if (yes)
                {
                    $audioTrackDiv.removeClass("none");
                }
                else
                {                
                    $audioTrackDiv.addClass("none");
                }
            }
        );
        

        Keyboard.on(Keyboard.BackgroundAudioPlayPause, 'reader', function()
        {
            var play = !$audioTrackDiv.hasClass('isPlaying');
            
            readium.reader.backgroundAudioTrackManager.setPlayState(play);
            readium.reader.backgroundAudioTrackManager.playPause(play);
        });
    
        $playAudioTrackBtn.on("click", function ()
        {
            var wasFocused = document.activeElement === $playAudioTrackBtn[0];
        
            readium.reader.backgroundAudioTrackManager.setPlayState(true);
            readium.reader.backgroundAudioTrackManager.playPause(true);
        
            if (wasFocused) setTimeout(function(){ $pauseAudioTrackBtn[0].focus(); }, 50);
        });
    
        $pauseAudioTrackBtn.on("click", function ()
        {
            var wasFocused = document.activeElement === $pauseAudioTrackBtn[0];
        
            readium.reader.backgroundAudioTrackManager.setPlayState(false);
            readium.reader.backgroundAudioTrackManager.playPause(false);
        
            if (wasFocused) setTimeout(function(){ $playAudioTrackBtn[0].focus(); }, 50);
        });
    };

    return {
        init : init
    };
});

/*! Hammer.JS - v2.0.4 - 2014-09-28
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2014 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge]
 * @returns {Object} dest
 */
function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
function merge(dest, src) {
    return extend(dest, src, true);
}

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        extend(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument;
    return (doc.defaultView || doc.parentWindow);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = last.deltaX - input.deltaX;
        var deltaY = last.deltaY - input.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y > 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) - getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.allow = true; // used by Input.TouchMouse to disable mouse events
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down, and mouse events are allowed (see the TouchMouse input)
        if (!this.pressed || !this.allow) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */
function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        // when we're in a touch event, so  block all upcoming mouse events
        // most mobile browser also emit mouseevents, right after touchstart
        if (isTouch) {
            this.mouse.allow = false;
        } else if (isMouse && !this.mouse.allow) {
            return;
        }

        // reset the allowMouse when we're done
        if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
            this.mouse.allow = true;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        // not needed with native support for the touchAction property
        if (NATIVE_TOUCH_ACTION) {
            return;
        }

        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE);
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // pan-x and pan-y can be combined
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_PAN_X + ' ' + TOUCH_ACTION_PAN_Y;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.id = uniqueId();

    this.manager = null;
    this.options = merge(options || {}, this.defaults);

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        extend(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(withState) {
            self.manager.emit(self.options.event + (withState ? stateStr(state) : ''), input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(true);
        }

        emit(); // simple 'eventName' events

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(true);
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = extend({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {
        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        this._super.emit.call(this, input);
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            this.manager.emit(this.options.event + inOut, input);
        }
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 500, // minimal time of the pointer to be pressed
        threshold: 5 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.65,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.velocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.velocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.velocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.direction &&
            input.distance > this.options.threshold &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.direction);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 2, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED ) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create an manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.4';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, { enable: false }],
        [PinchRecognizer, { enable: false }, ['rotate']],
        [SwipeRecognizer,{ direction: DIRECTION_HORIZONTAL }],
        [PanRecognizer, { direction: DIRECTION_HORIZONTAL }, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, { event: 'doubletap', taps: 2 }, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    options = options || {};

    this.options = merge(options, Hammer.defaults);
    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        extend(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        var recognizers = this.recognizers;
        recognizer = this.get(recognizer);
        recognizers.splice(inArray(recognizers, recognizer), 1);

        this.touchAction.update();
        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    each(manager.options.cssProps, function(value, name) {
        element.style[prefixed(element.style, name)] = add ? value : '';
    });
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

extend(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

if (typeof define == TYPE_FUNCTION && define.amd) {
    define('hammerjs',[],function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define('jquery_hammer',['jquery', 'hammerjs'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('hammerjs'));
    } else {
        factory(jQuery, Hammer);
    }
}(function($, Hammer) {
    function hammerify(el, options) {
        var $el = $(el);
        if(!$el.data("hammer")) {
            $el.data("hammer", new Hammer($el[0], options));
        }
    }

    $.fn.hammer = function(options) {
        return this.each(function() {
            hammerify(this, options);
        });
    };

    // extend the emit method to also trigger jQuery events
    Hammer.Manager.prototype.emit = (function(originalEmit) {
        return function(type, data) {
            originalEmit.call(this, type, data);
            $(this.element).trigger({
                type: type,
                gesture: data
            });
        };
    })(Hammer.Manager.prototype.emit);
}));

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('gestures',['jquery','jquery_hammer','hammerjs'], function($,jqueryHammer,Hammer) {

    var gesturesHandler = function(reader, viewport){

        var onSwipeLeft = function(){
            reader.openPageRight();
        };

        var onSwipeRight = function(){
            reader.openPageLeft();
        };

        var isGestureHandled = function() {
            var viewType = reader.getCurrentViewType();

            return viewType === ReadiumSDK.Views.ReaderView.VIEW_TYPE_FIXED || viewType == ReadiumSDK.Views.ReaderView.VIEW_TYPE_COLUMNIZED;
        };

        this.initialize= function(){

            reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function(iframe,s) {
                //set hammer's document root
                Hammer.DOCUMENT = iframe.contents();
                //hammer's internal touch events need to be redefined? (doesn't work without)
                Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_MOVE, Hammer.detection.detect);
                Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_END, Hammer.detection.detect);

                //set up the hammer gesture events
                //swiping handlers
                var swipingOptions = {prevent_mouseevents: true};
                Hammer(Hammer.DOCUMENT,swipingOptions).on("swipeleft", function() {
                    onSwipeLeft();
                });
                Hammer(Hammer.DOCUMENT,swipingOptions).on("swiperight", function() {
                    onSwipeRight();
                });

                //remove stupid ipad safari elastic scrolling
                //TODO: test this with reader ScrollView and FixedView
                $(Hammer.DOCUMENT).on(
                    'touchmove',
                    function(e) {
                        //hack: check if we are not dealing with a scrollview
                        if(isGestureHandled()){
                            e.preventDefault();
                        }
                    }
                );
            });

            //remove stupid ipad safari elastic scrolling (improves UX for gestures)
            //TODO: test this with reader ScrollView and FixedView
            $(viewport).on(
                'touchmove',
                function(e) {
                    if(isGestureHandled()) {
                        e.preventDefault();
                    }
                }
            );

            //handlers on viewport
            $(viewport).hammer().on("swipeleft", function() {
                onSwipeLeft();
            });
            $(viewport).hammer().on("swiperight", function() {
                onSwipeRight();
            });
        };

    };
    return gesturesHandler;
});
define('versioning/Versioning',['text!version.json', 'Readium'], function(versionTxt, Readium){
	var version = JSON.parse(versionTxt);

	var PackagedVersioning = {
		getVersioningInfo : function(callback){
			var versionInfo = {};
			var readiumVersion = Readium.version;
            versionInfo.viewer = version;
            versionInfo.viewer.dateTimeString = new Date(version.timestamp).toString();
            versionInfo.readiumJs = readiumVersion.readiumJs;
            versionInfo.readiumSharedJs = readiumVersion.readiumSharedJs;
			callback(versionInfo);
		}

	}
	return PackagedVersioning;
});
define('EpubReader',[
'module',
'jquery',
'bootstrap',
'bootstrapA11y',
'URIjs',
'Spinner',
'storage/Settings',
'i18n/Strings',
'Dialogs',
'ReaderSettingsDialog',
'hgn!templates/about-dialog.html',
'hgn!templates/reader-navbar.html',
'hgn!templates/reader-body.html',
'hgn!templates/reader-body-page-btns.html',
'analytics/Analytics',
'screenfull',
'Keyboard',
'EpubReaderMediaOverlays',
'EpubReaderBackgroundAudioTrack',
'gestures',
'versioning/Versioning',
'Readium'],

function (
module,
$,
bootstrap,
bootstrapA11y,
URI,
spinner,
Settings,
Strings,
Dialogs,
SettingsDialog,
AboutDialog,
ReaderNavbar,
ReaderBody,
ReaderBodyPageButtons,
Analytics,
screenfull,
Keyboard,
EpubReaderMediaOverlays,
EpubReaderBackgroundAudioTrack,
GesturesHandler,
Versioning,
Readium){

    var readium, 
        embedded,
        url,
        el = document.documentElement,
        currentDocument,
        gesturesHandler;

    // This function will retrieve a package document and load an EPUB
    var loadEbook = function (packageDocumentURL, readerSettings, openPageRequest) {
        
        readium.openPackageDocument(packageDocumentURL, function(packageDocument, options){
            currentDocument = packageDocument;
            currentDocument.generateTocListDOM(function(dom){
                loadToc(dom)
            });

            wasFixed = readium.reader.isCurrentViewFixedLayout();
            var metadata = options.metadata;

            $('<h2 class="book-title-header"></h2>').insertAfter('.navbar').text(metadata.title);

        
            $("#left-page-btn").unbind("click");
            $("#right-page-btn").unbind("click");
            var $pageBtnsContainer = $('#readium-page-btns');
            $pageBtnsContainer.empty();
            var rtl = currentDocument.getPageProgressionDirection() === "rtl"; //_package.spine.isLeftToRight()
            $pageBtnsContainer.append(ReaderBodyPageButtons({strings: Strings, dialogs: Dialogs, keyboard: Keyboard,
                pageProgressionDirectionIsRTL: rtl
            }));
            $("#left-page-btn").on("click", prevPage);
            $("#right-page-btn").on("click", nextPage);

        }, openPageRequest);
    };

    var spin = function()
    {
//console.error("do SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
        if (spinner.willSpin || spinner.isSpinning) return;
        
        spinner.willSpin = true;
        
        setTimeout(function()
        {
            if (spinner.stopRequested)
            {
//console.debug("STOP REQUEST: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.willSpin = false;
                spinner.stopRequested = false;
                return;
            }
//console.debug("SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
            spinner.isSpinning = true;
            spinner.spin($('#reading-area')[0]);
            
            spinner.willSpin = false;
            
        }, 100);
    };

    var tocShowHideToggle = function(){
        
        $(document.body).removeClass('hide-ui');
        
        var $appContainer = $('#app-container'),
            hide = $appContainer.hasClass('toc-visible');
        var bookmark;
        if (readium.reader.handleViewportResize && !embedded){
            bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
        }

        if (hide){
            $appContainer.removeClass('toc-visible');

            setTimeout(function(){ $('#tocButt')[0].focus(); }, 100);
        }
        else{
            $appContainer.addClass('toc-visible');

            setTimeout(function(){ $('#readium-toc-body button.close')[0].focus(); }, 100);
        }

        if(embedded){
            hideLoop(null, true);
        }else if (readium.reader.handleViewportResize){

            readium.reader.handleViewportResize();
            
            setTimeout(function()
            {
                readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
            }, 90);
        }
    };

    var showScaleDisplay = function(){
        $('.zoom-wrapper').show();
    }
    var setScaleDisplay = function(){
        var scale = readium.reader.getViewScale();
        $('.zoom-wrapper input').val(Math.round(scale) + "%");
    }

    var hideScaleDisplay = function(){
        $('.zoom-wrapper').hide();
    }

    var loadToc = function(dom){
        
        if (dom) {
            $('script', dom).remove();

            var tocNav;

            var $navs = $('nav', dom);
            Array.prototype.every.call($navs, function(nav){
                if (nav.getAttributeNS('http://www.idpf.org/2007/ops', 'type') == 'toc'){
                    tocNav = nav;
                    return false;
                }
                return true;
            });

            var isRTL = false;
            var pparent = tocNav;

            while (pparent && pparent.getAttributeNS)
            {
                var dir = pparent.getAttributeNS("http://www.w3.org/1999/xhtml", "dir") || pparent.getAttribute("dir");

                if (dir && dir === "rtl")
                {
                    isRTL = true;
                    break;
                }
                pparent = pparent.parentNode;
            }
        
            var toc = (tocNav && $(tocNav).html()) || $('body', dom).html() || $(dom).html();
            var tocUrl = currentDocument.getToc();

            if (toc && toc.length)
            {
                var $toc = $(toc);

                // "iframe" elements need to be stripped out, because of potential vulnerability when loading malicious EPUBs
                // e.g. src="javascript:doHorribleThings(window.top)"
                // Note that "embed" and "object" elements with AllowScriptAccess="always" do not need to be removed,
                // because unlike "iframe" the @src URI does not trigger the execution of the "javascript:" statement,
                // and because the "data:" base64 encoding of an image/svg that contains ecmascript
                // automatically results in origin/domain restrictions (thereby preventing access to window.top / window.parent).
                // Also note that "script" elements are discarded automatically by jQuery.
                $('iframe', $toc).remove();

                $('#readium-toc-body').append($toc);

                if (isRTL)
                {
                    $toc[0].setAttributeNS("http://www.w3.org/1999/xhtml", "dir", "rtl");
                    $toc[0].style.direction = "rtl"; // The CSS stylesheet property does not trigger :(
                }
            }
        
        } else {
            var tocUrl = currentDocument.getToc();

            $('#readium-toc-body').append("?? " + tocUrl);
        }
    
        var _tocLinkActivated = false;
        
        var lastIframe = undefined,
            wasFixed;

        readium.reader.on(ReadiumSDK.Events.FXL_VIEW_RESIZED, setScaleDisplay);
        readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem)
        {
            
            var isFixed = readium.reader.isCurrentViewFixedLayout();

            // TODO: fix the pan-zoom feature!
            if (isFixed){
                showScaleDisplay();
            }
            else{
                hideScaleDisplay();
            }

            //TODO not picked-up by all screen readers, so for now this short description will suffice
            $iframe.attr("title", "EPUB");
            $iframe.attr("aria-label", "EPUB");
            
            lastIframe = $iframe[0];
        });
        
        readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData)
        {
            savePlace();
            updateUI(pageChangeData);
            

            if (spinner.isSpinning)
            {
//console.debug("!! SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stop();
                spinner.isSpinning = false;
            }
            else if (spinner.willSpin)
            {
//console.debug("!! SPIN REQ: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stopRequested = true;
            }
            
            if (!_tocLinkActivated) return;
            _tocLinkActivated = false;
            
            try
            {
                var iframe = undefined;
                var element = undefined;
                
                var id = pageChangeData.elementId;
                if (!id)
                {
                    var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());

                    //bookmark.idref; //manifest item
                    if (pageChangeData.spineItem)
                    {
                        element = readium.reader.getElementByCfi(pageChangeData.spineItem, bookmark.contentCFI,
                            ["cfi-marker", "mo-cfi-highlight"],
                            [],
                            ["MathJax_Message"]);
                        element = element[0];
                        
                        if (element)
                        {
                            iframe = $("#epub-reader-frame iframe")[0];
                            var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                            if (element.ownerDocument !== doc)
                            {
                                iframe = $("#epub-reader-frame iframe")[1];
                                if (iframe)
                                {
                                    doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                                    if (element.ownerDocument !== doc)
                                    {
                                        iframe = undefined;
                                    }
                                }
                            }
                        }
                    }
                }
                else
                {
                    iframe = $("#epub-reader-frame iframe")[0];
                    var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                    element = doc.getElementById(id);
                    if (!element)
                    {
                        iframe = $("#epub-reader-frame iframe")[1];
                        if (iframe)
                        {
                            doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                            element = doc.getElementById(id);
                            if (!element)
                            {
                                iframe = undefined;
                            }
                        }
                    }
                }

                if (!iframe)
                {
                    iframe = lastIframe;
                }
                
                if (iframe)
                {
                    //var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                    var toFocus = iframe; //doc.body
                    setTimeout(function(){ toFocus.focus(); }, 50);
                }
            }
            catch (e)
            {
                //
            }
        });

        $('#readium-toc-body').on('click', 'a', function(e)
        {
            spin();
            
            var href = $(this).attr('href');
            href = tocUrl ? new URI(href).absoluteTo(tocUrl).toString() : href; 

            _tocLinkActivated = true;

            readium.reader.openContentUrl(href);
        
            if (embedded){
                $('.toc-visible').removeClass('toc-visible');
                $(document.body).removeClass('hide-ui');
            }
            return false;
        });
        $('#readium-toc-body').prepend('<button tabindex="50" type="button" class="close" data-dismiss="modal" aria-label="'+Strings.i18n_close+' '+Strings.toc+'" title="'+Strings.i18n_close+' '+Strings.toc+'"><span aria-hidden="true">&times;</span></button>');
        $('#readium-toc-body button.close').on('click', function(){
            tocShowHideToggle();
            /*
            var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
            $('#app-container').removeClass('toc-visible');
            if (embedded){
                $(document.body).removeClass('hide-ui');
            }else if (readium.reader.handleViewportResize){
                readium.reader.handleViewportResize();
                readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
            }
            */
            return false;
        })
    }

    var toggleFullScreen = function(){
        
        if (!screenfull.enabled) return;

        screenfull.toggle();
    }

    screenfull.onchange = function(e){
        var titleText;

        if (screenfull.isFullscreen)
        {
            titleText = Strings.exit_fullscreen+ ' [' + Keyboard.FullScreenToggle + ']';
            $('#buttFullScreenToggle span').removeClass('glyphicon-resize-full');
            $('#buttFullScreenToggle span').addClass('glyphicon-resize-small');
            $('#buttFullScreenToggle').attr('aria-label', titleText);
            $('#buttFullScreenToggle').attr('title', titleText);
        }
        else
        {
            titleText = Strings.enter_fullscreen + ' [' + Keyboard.FullScreenToggle + ']';
            $('#buttFullScreenToggle span').removeClass('glyphicon-resize-small');
            $('#buttFullScreenToggle span').addClass('glyphicon-resize-full'); 
            $('#buttFullScreenToggle').attr('aria-label', titleText);
            $('#buttFullScreenToggle').attr('title', titleText);
        }
    }

    var hideUI = function(){
        hideTimeoutId = null;
        // don't hide it toolbar while toc open in non-embedded mode
        if (!embedded && $('#app-container').hasClass('toc-visible')){
            return;
        }
        
        var navBar = document.getElementById("app-navbar");
        if (document.activeElement) {
            var within = jQuery.contains(navBar, document.activeElement);
            if (within) return;
        }
        
        var $navBar = $(navBar);
        // BROEKN! $navBar.is(':hover')
        var isMouseOver = $navBar.find(':hover').length > 0;
        if (isMouseOver) return;
        
        if ($('#audioplayer').hasClass('expanded-audio')) return;

        $(document.body).addClass('hide-ui');
    }

    var hideTimeoutId;

    var hideLoop = function(e, immediate){

        // if (!embedded){
        //     return;
        // }
        if (hideTimeoutId){
            window.clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }
        if (!$('#app-container').hasClass('toc-visible') && $(document.body).hasClass('hide-ui')){
            $(document.body).removeClass('hide-ui');
        }
        if (immediate){
            hideUI();
        }
        else{
            hideTimeoutId = window.setTimeout(hideUI, 4000);
        }
    }

    //TODO: also update "previous/next page" commands status (disabled/enabled), not just button visibility.
    // https://github.com/readium/readium-js-viewer/issues/188
    // See onSwipeLeft() onSwipeRight() in gesturesHandler.
    // See nextPage() prevPage() in this class.
    var updateUI = function(pageChangeData){
        if(pageChangeData.paginationInfo.canGoLeft())
            $("#left-page-btn").show();
        else
            $("#left-page-btn").hide();
        if(pageChangeData.paginationInfo.canGoRight())
            $("#right-page-btn").show();
        else
            $("#right-page-btn").hide();
    }
    
    var savePlace = function(){
        Settings.put(url, readium.reader.bookmarkCurrentPage(), $.noop);
    }

    var nextPage = function () {

        readium.reader.openPageRight();
        return false;
    };

    var prevPage = function () {

        readium.reader.openPageLeft();
        return false;
    };

    var installReaderEventHandlers = function(){
        
        // Set handlers for click events
        $(".icon-annotations").on("click", function () {
            readium.reader.plugins.annotations.addSelectionHighlight(Math.floor((Math.random()*1000000)), "highlight");
        });

        var isWithinForbiddenNavKeysArea = function()
        {
            return document.activeElement &&
            (
                document.activeElement === document.getElementById('volume-range-slider')
                || document.activeElement === document.getElementById('time-range-slider')
                || document.activeElement === document.getElementById('rate-range-slider')
                || jQuery.contains(document.getElementById("mo-sync-form"), document.activeElement)
                || jQuery.contains(document.getElementById("mo-highlighters"), document.activeElement)
                
                // jQuery.contains(document.getElementById("app-navbar"), document.activeElement)
                // || jQuery.contains(document.getElementById("settings-dialog"), document.activeElement)
                // || jQuery.contains(document.getElementById("about-dialog"), document.activeElement)
            )
            ;
        };

        var hideTB = function(){
            if (!embedded && $('#app-container').hasClass('toc-visible')){
                return;
            }
            $(document.body).addClass('hide-ui');
            if (document.activeElement) document.activeElement.blur();
        };
        $("#buttHideToolBar").on("click", hideTB);
        Keyboard.on(Keyboard.ToolbarHide, 'reader', hideTB);

        var showTB = function(){
            $("#aboutButt1")[0].focus();
            $(document.body).removeClass('hide-ui');
            setTimeout(function(){ $("#aboutButt1")[0].focus(); }, 50);
        };
        $("#buttShowToolBar").on("click", showTB);
        Keyboard.on(Keyboard.ToolbarShow, 'reader', showTB);

        Keyboard.on(Keyboard.PagePrevious, 'reader', function(){
            if (!isWithinForbiddenNavKeysArea()) prevPage();
        });
        
        Keyboard.on(Keyboard.PagePreviousAlt, 'reader', prevPage);
        
        Keyboard.on(Keyboard.PageNextAlt, 'reader', nextPage);
        
        Keyboard.on(Keyboard.PageNext, 'reader', function(){
            if (!isWithinForbiddenNavKeysArea()) nextPage();
        });
        
        Keyboard.on(Keyboard.FullScreenToggle, 'reader', toggleFullScreen);
        
        $('#buttFullScreenToggle').on('click', toggleFullScreen);

        var loadlibrary = function()
        {
            $("html").attr("data-theme", "library");
            
            $(window).trigger('loadlibrary');
        };

        Keyboard.on(Keyboard.SwitchToLibrary, 'reader', loadlibrary /* function(){setTimeout(, 30);} */ );
        
        $('.icon-library').on('click', function(){
            loadlibrary();
            return false;
        });

        $('.zoom-wrapper input').on('click', function(){
            if (!this.disabled){
                this.focus();
                return false;
            }
        });

        Keyboard.on(Keyboard.TocShowHideToggle, 'reader', function()
        {
            var visible = $('#app-container').hasClass('toc-visible');
            if (!visible)
            {
                tocShowHideToggle();
            }
            else
            {
                setTimeout(function(){ $('#readium-toc-body button.close')[0].focus(); }, 100);
            }
        });
        
        $('.icon-toc').on('click', tocShowHideToggle);

        var setTocSize = function(){
            var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
            $('#app-container').height(appHeight);
            $('#readium-toc-body').height(appHeight);
        };

        Keyboard.on(Keyboard.ShowSettingsModal, 'reader', function(){$('#settings-dialog').modal("show")});

        $(window).on('mousemove', hideLoop);
        $(window).on('resize', setTocSize);
        setTocSize();
        hideLoop();

        // captures all clicks on the document on the capture phase. Not sure if it's possible with jquery
        // so I'm using DOM api directly
        document.addEventListener('click', hideLoop, true);
    };

    var setFitScreen = function(e){
        readium.reader.setZoom({style: 'fit-screen'});
        $('.active-zoom').removeClass('active-zoom');
        $('#zoom-fit-screen').addClass('active-zoom');
        $('.zoom-wrapper input').prop('disabled', true);
        $('.zoom-wrapper>a').dropdown('toggle');
        return false;
    }

    var setFitWidth = function(e){
        readium.reader.setZoom({style: 'fit-width'});
        $('.active-zoom').removeClass('active-zoom');
        $('#zoom-fit-width').addClass('active-zoom');
        $('.zoom-wrapper input').prop('disabled', true);
         $('.zoom-wrapper>a').dropdown('toggle');
        return false;
    }

    var enableCustom = function(e){
        $('.zoom-wrapper input').prop('disabled', false).focus();
        $('.active-zoom').removeClass('active-zoom');
        $('#zoom-custom').addClass('active-zoom');
         $('.zoom-wrapper>a').dropdown('toggle');
        return false;
    }

    var zoomRegex = /^\s*(\d+)%?\s*$/;
    var setCustom = function(e){
        var percent = $('.zoom-wrapper input').val();
        var matches = zoomRegex.exec(percent);
        if (matches){
            var percentVal = Number(matches[1])/100;
            readium.reader.setZoom({style: 'user', scale: percentVal});
        }
        else{
            setScaleDisplay();
        }
    }

    var loadReaderUIPrivate = function(){
        $('.modal-backdrop').remove();
        var $appContainer = $('#app-container');
        $appContainer.empty();
        $appContainer.append(ReaderBody({strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));
        $('nav').empty();
        $('nav').attr("aria-label", Strings.i18n_toolbar);
        $('nav').append(ReaderNavbar({strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));
        installReaderEventHandlers();
        document.title = "Readium";
        $('#zoom-fit-width a').on('click', setFitWidth);
        $('#zoom-fit-screen a').on('click', setFitScreen);
        $('#zoom-custom a').on('click', enableCustom);
        $('.zoom-wrapper input').on('change', setCustom);
        
        spin();
    }
    
    var loadReaderUI = function (data) {
        
        Keyboard.scope('reader');
        
        url = data.epub;
        Analytics.trackView('/reader');
        embedded = data.embedded;

        loadReaderUIPrivate();
        
        //because we reinitialize the reader we have to unsubscribe to all events for the previews reader instance
        if(readium && readium.reader) {
            readium.reader.off();
        }
        
        setTimeout(function()
        {
            initReadium(); //async
        }, 0);
    };

    var initReadium = function(){

        Settings.getMultiple(['reader', url], function(settings){

            var prefix = (self.location && self.location.origin && self.location.pathname) ? (self.location.origin + self.location.pathname + "/..") : "";
            var readerOptions =  {
                el: "#epub-reader-frame", 
                annotationCSSUrl: module.config().annotationCssUrl || (prefix + "/css/annotations.css"),
                mathJaxUrl : module.config().mathJaxUrl ? (prefix + module.config().mathJaxUrl) : (prefix + "/scripts/mathjax/MathJax.js")
            };

            var readiumOptions = {
                jsLibRoot: module.config().jsLibRoot || './scripts/zip/',
                openBookOptions: {}
            };

            if (module.config().useSimpleLoader){
                readiumOptions.useSimpleLoader = true;
            }

            var openPageRequest;
            if (settings[url]){
                var bookmark = JSON.parse(JSON.parse(settings[url]));
                openPageRequest = {idref: bookmark.idref, elementCfi: bookmark.contentCFI};
            }


            readium = new Readium(readiumOptions, readerOptions);

            window.READIUM = readium;

            ReadiumSDK.on(ReadiumSDK.Events.PLUGINS_LOADED, function () {
                console.log('PLUGINS INITIALIZED!');
                readium.reader.plugins.annotations.initialize({annotationCSSUrl: readerOptions.annotationCSSUrl});
            });

            //setup gestures support with hummer
            gesturesHandler = new GesturesHandler(readium.reader, readerOptions.el);
            gesturesHandler.initialize();

            //epubReadingSystem

            Versioning.getVersioningInfo(function(version){

                $('#app-container').append(AboutDialog({strings: Strings, viewer: version.viewer, readium: version.readiumJs, sharedJs: version.readiumSharedJs}));
                
                window.navigator.epubReadingSystem.name = "readium-js-viewer";
                window.navigator.epubReadingSystem.version = version.viewer.version;
                
                window.navigator.epubReadingSystem.readium = {};
                
                window.navigator.epubReadingSystem.readium.buildInfo = {};
                
                window.navigator.epubReadingSystem.readium.buildInfo.dateTime = version.viewer.dateTimeString; //new Date(timestamp).toString();
                window.navigator.epubReadingSystem.readium.buildInfo.version = version.viewer.version;
                window.navigator.epubReadingSystem.readium.buildInfo.chromeVersion = version.viewer.chromeVersion;
                
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories = [];
                
                var repo1 = {};
                repo1.name = "readium-js-viewer";
                repo1.sha = version.viewer.sha;
                repo1.tag = version.viewer.tag;
                repo1.clean = version.viewer.clean;
                repo1.url = "https://github.com/readium/" + repo1.name + "/tree/" + repo1.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo1);
                
                var repo2 = {};
                repo2.name = "readium-js";
                repo2.sha = version.readiumJs.sha;
                repo2.tag = version.readiumJs.tag;
                repo2.clean = version.readiumJs.clean;
                repo2.url = "https://github.com/readium/" + repo2.name + "/tree/" + repo2.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo2);
                
                var repo3 = {};
                repo3.name = "readium-shared-js";
                repo3.sha = version.readiumSharedJs.sha;
                repo3.tag = version.readiumSharedJs.tag;
                repo3.clean = version.readiumSharedJs.clean;
                repo3.url = "https://github.com/readium/" + repo3.name + "/tree/" + repo3.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo3);

                // Debug check:
                //console.debug(JSON.stringify(window.navigator.epubReadingSystem, undefined, 2));
            });
            

            $(window).on('keyup', function(e)
            {
                if (e.keyCode === 9 || e.which === 9)
                {
                    $(document.body).removeClass('hide-ui');
                }
            });

            readium.reader.addIFrameEventListener('mousemove', function() {
                hideLoop();
            });
            
            readium.reader.addIFrameEventListener('keydown', function(e) {
                Keyboard.dispatch(document.documentElement, e.originalEvent);
            });
            
            readium.reader.addIFrameEventListener('keyup', function(e) {
                Keyboard.dispatch(document.documentElement, e.originalEvent);
            });
            
            readium.reader.addIFrameEventListener('focus', function(e) {
                $(window).trigger("focus");
            });

            SettingsDialog.initDialog(readium.reader);

            $('#settings-dialog').on('hidden.bs.modal', function () {

                Keyboard.scope('reader');

                $(document.body).removeClass('hide-ui');
                setTimeout(function(){ $("#settbutt1").focus(); }, 50);
    
                $("#buttSave").removeAttr("accesskey");
                $("#buttClose").removeAttr("accesskey");
            });
            $('#settings-dialog').on('shown.bs.modal', function () {

                Keyboard.scope('settings');
    
                $("#buttSave").attr("accesskey", Keyboard.accesskeys.SettingsModalSave);
                $("#buttClose").attr("accesskey", Keyboard.accesskeys.SettingsModalClose);
            });


            $('#about-dialog').on('hidden.bs.modal', function () {
                Keyboard.scope('reader');

                $(document.body).removeClass('hide-ui');
                setTimeout(function(){ $("#aboutButt1").focus(); }, 50);
            });
            $('#about-dialog').on('shown.bs.modal', function(){
                Keyboard.scope('about');
            });
    
            var readerSettings;
            if (settings.reader){
                readerSettings = JSON.parse(settings.reader);
            }
            if (!embedded){
                readerSettings = readerSettings || SettingsDialog.defaultSettings;
                SettingsDialog.updateReader(readium.reader, readerSettings);
            }
            else{
                readium.reader.updateSettings({
                    syntheticSpread:  "auto",
                    scroll: "auto"
                });
            }
            

            var toggleNightTheme = function(){

                if (!embedded){
            
                    Settings.get('reader', function(json)
                    {
                        if (!json)
                        {
                            json = {};
                        }

                        var isNight = json.theme === "night-theme";
                        json.theme = isNight ? "author-theme" : "night-theme";
                        
                        Settings.put('reader', json);

                        SettingsDialog.updateReader(readium.reader, json);
                    });
                }
            };
            $("#buttNightTheme").on("click", toggleNightTheme);
            Keyboard.on(Keyboard.NightTheme, 'reader', toggleNightTheme);

            readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, function($iframe, spineItem) {
                spin();
            });
            
            EpubReaderMediaOverlays.init(readium);
            
            EpubReaderBackgroundAudioTrack.init(readium);
            
            loadEbook(url, readerSettings, openPageRequest);

            readium.reader.plugins.annotations.on("annotationClicked", function(type, idref, cfi, id) {
console.debug("ANNOTATION CLICK: " + id);
                readium.reader.plugins.annotations.removeHighlight(id);
            });

            readium.reader.plugins.example.on("exampleEvent", function(message) {
                alert(message);
            });

        });
    }

    var unloadReaderUI = function(){

        if (readium) {
            readium.closePackageDocument();
        }
        
        // needed only if access keys can potentially be used to open a book while a dialog is opened, because keyboard.scope() is not accounted for with HTML access keys :(
        // for example: settings dialogs is open => SHIFT CTRL [B] access key => library view opens with transparent black overlay!
        Dialogs.closeModal();
        Dialogs.reset();
        $('#settings-dialog').modal('hide');
        $('#about-dialog').modal('hide');
        $('.modal-backdrop').remove();
        
        
        Keyboard.off('reader');
        Keyboard.off('settings');

        $('#settings-dialog').off('hidden.bs.modal');
        $('#settings-dialog').off('shown.bs.modal');

        $('#about-dialog').off('hidden.bs.modal');
        $('#about-dialog').off('shown.bs.modal');

        // visibility check fails because iframe is unloaded
        //if (readium.reader.isMediaOverlayAvailable())
        if (readium && readium.reader) // window.push/popstate
            readium.reader.pauseMediaOverlay();
        
        $(window).off('resize');
        $(window).off('mousemove');
        $(window).off('keyup');
        $(window).off('message');
        window.clearTimeout(hideTimeoutId);
        $(document.body).removeClass('embedded');
        document.removeEventListener('click', hideLoop, true);
        $('.book-title-header').remove();

        $(document.body).removeClass('hide-ui');
    }
    
    var applyKeyboardSettingsAndLoadUi = function(data)
    {
        // override current scheme with user options
        Settings.get('reader', function(json)
        {
           Keyboard.applySettings(json);
           
           loadReaderUI(data);
        });
    };
    
    return {
        loadUI : applyKeyboardSettingsAndLoadUi,
        unloadUI : unloadReaderUI
    };
    
});

require(['jquery', 'EpubReader'], function($, EpubReader){

	var getQueryParamData = function(){
        var query = window.location.search;
        if (query && query.length){
            query = query.substring(1);
        }
        data = {};
        if (query.length){
            var keyParams = query.split('&');
            for (var x = 0; x < keyParams.length; x++)
            {
                var keyVal = keyParams[x].split('=');
                if(keyVal.length > 1){
                    data[keyVal[0]] = keyVal[1];
                }
                
            }

        }
        return data;
    }

    $(function(){
    	var epubUrl = getQueryParamData();
    	EpubReader.loadUI(data);

		$(document.body).on('click', function()
        {
            $(document.body).removeClass("keyboard");
        });

		$(document).on('keyup', function(e)
        {
            $(document.body).addClass("keyboard");
        });
    });

	var tooltipSelector = 'nav *[title]';
    
	$(document.body).tooltip({
		selector : tooltipSelector,
		placement: 'auto',
		container: 'body' // do this to prevent weird navbar re-sizing issue when the tooltip is inserted 
	}).on('show.bs.tooltip', function(e){
		$(tooltipSelector).not(e.target).tooltip('destroy');
	});
});
define("ReadiumViewerLite", function(){});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium-js-viewer_LITE',['ReadiumViewerLite'], function (ReadiumViewerLite) {
//noop
});


//# sourceMappingURL=readium-js-viewer_LITE.js.map