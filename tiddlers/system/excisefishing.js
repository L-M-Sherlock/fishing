/*\
title: $:/core/modules/editor/operations/text/excisefishing.js
type: application/javascript
module-type: texteditoroperation

Text editor operation to excise the selection to a new fishing qa tiddler.
Based on TW's core/modules/editor/operations/text/excise.js

\*/
exports['excisefishing'] = function (event, operation) {
  const editTiddler = this.wiki.getTiddler(this.editTitle);
  let editTiddlerTitle = this.editTitle;
  if (editTiddler && editTiddler.fields['draft.of']) {
    editTiddlerTitle = editTiddler.fields['draft.of'];
  }
  const fishingTag = event.paramObject.fishingTag || '?';
  // add due, default due in one day
  const due = new Date(new Date().getTime() + 1).toISOString().replace(/-|T|:|\.|Z/g, '');
  // we add current time to legacy title, so won't collide with parent title
  const currentTime = new Date(new Date().getTime()).toISOString().replace(/-|T|:|\.|Z/g, '');

  const excisionQuestion = this.wiki.generateNewTitle(operation.selection);
  const title = excisionQuestion;
  const excisionAnswer = event.paramObject.selectionAsAnswer === 'yes' ? operation.selection : '';
  // add template
  const captionTemplate = event.paramObject.template
    ? `{{||${event.paramObject.template}}}`
    : event.paramObject.randomCaption
    ? `${editTiddlerTitle}/${currentTime}`
    : '';
  this.wiki.addTiddler(
    new $tw.Tiddler(this.wiki.getCreationFields(), this.wiki.getModificationFields(), {
      title,
      text: excisionAnswer,
      tags: event.paramObject.tagnew === 'yes' ? [editTiddlerTitle, fishingTag] : [fishingTag],
      due,
      caption: captionTemplate,
    })
  );
  // "?" is the default fishing macro
  operation.replacement = `<<${event.paramObject.macro || '?'} """${excisionQuestion}""">>`;
  if (event.paramObject.cut === 'yes') {
    operation.cutStart = operation.selStart;
    operation.cutEnd = operation.selEnd;
    operation.newSelStart = operation.selStart;
    operation.newSelEnd = operation.selStart + operation.replacement.length;
  } else {
    // don't need to delete original texts
    operation.cutStart = operation.selEnd;
    operation.cutEnd = operation.selEnd;
    operation.newSelStart = operation.selStart + operation.replacement.length;
    operation.newSelEnd = operation.selStart + operation.replacement.length;
  }
};
