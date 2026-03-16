module.exports = function (HTMLHint) {
  HTMLHint.addRule({
    id: "my-custom-rule",
    description: "This is my custom rule description",
    init: function (parser, reporter, options) {
      // Rule implementation goes here
    },
  });
};
