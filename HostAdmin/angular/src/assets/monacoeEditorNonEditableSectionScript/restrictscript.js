function restrictMethod(editorInstance, monaco, changedCode = null, resetflag = false) {
  const model = editorInstance.getModel();
  const constrainedInstance = constrainedEditor(monaco);
  constrainedInstance.initializeIn(editorInstance);
  var changedcodearray = changedCode?.split("\n");
  let ranges = changedCode != null ? getEditableRanges(model, changedcodearray) : getEditableRanges(model, model.getLinesContent());
  if (resetflag) {
    model.updateRestrictions(ranges);
  }
  else {
    constrainedInstance.addRestrictionsTo(model, ranges);
  }
}


function getEditableRanges(model, defaultcontent) {
  let isRestricted = false;
  let Restricted_StartComment = "noneditablestartshere";
  let Restricted_EndComment = "noneditableendshere";
  const Ranges = [];
  for (let lineno = 0; lineno < defaultcontent.length;) {
    if (!isRestricted && defaultcontent[lineno].replaceAll(' ', '').toLowerCase().includes(Restricted_StartComment)) {
      isRestricted = true;
    }
    else if (isRestricted && defaultcontent[lineno].replaceAll(' ', '').toLowerCase().includes(Restricted_EndComment)) {
      isRestricted = false;
    }
    else if (!isRestricted) {
      let startline = lineno;
      let endline = startline;
      for (let index = startline + 1; index < defaultcontent.length;) {
        if (!isRestricted && defaultcontent[index].replaceAll(' ', '').toLowerCase().includes(Restricted_StartComment)) {
          isRestricted = true;
          endline = index - 1;
          lineno = endline;
          break;
        }
        index++;
        endline = index - 1;
        lineno = endline;
      }
      Ranges.push({
        range: [startline + 1, 1, endline + 1, model.getLineContent(endline + 1).length + 1], // Range of Function definition
        allowMultiline: true
      })
    }
    lineno++;
  }
  return Ranges;
}