var windowAddEventListener = Window.prototype.addEventListener;
Window.prototype.addEventListener = function(type) {
  if (type === 'unload' || type === 'beforeunload') 
	return true;
  else
    return windowAddEventListener.apply(window, arguments);
};
navigator.epubReadingSystem = window.parent.navigator.epubReadingSystem;
window.parent = window.self;
window.top = window.self;