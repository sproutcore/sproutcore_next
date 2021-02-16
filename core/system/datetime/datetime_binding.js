  /**
    Adds a transform to format the DateTime value to a String value according
    to the passed format string.
  
        valueBinding: Binding.dateTime('%Y-%m-%d %H:%M:%S')
                                .from('MyApp.myController.myDateTime');
  
    @param {String} format format string
    @returns {Binding} this
  */

export const dateTimeBinding = function (format) {
  return this.transform(function (value) {
    return value ? value.toFormattedString(format) : null;
  });
};

// it is added to SC.Binding in the /core/core.js