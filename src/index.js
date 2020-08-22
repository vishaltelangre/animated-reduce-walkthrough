import { select, selectAll, transition } from "d3";

document.addEventListener("DOMContentLoaded", async () => {
  const items = selectAll(".item");
  const initialValue = select(".initial");
  const itemArg1 = select(".itemArg1");
  const itemArg2 = select(".itemArg2");
  const accArg1 = select(".accArg1");
  const accArg2 = select(".accArg2");
  const accEquation = select(".accEq");
  const calculatedAcc = select(".calculatedAcc");

  const sleep = (seconds) =>
    new Promise((resolve) => setTimeout(resolve, seconds * 1000));

  const activeStyle = (selection, text, delay = 1000, duration = 100) =>
    selection
      .transition()
      .delay(delay)
      .duration(duration)
      .style("color", "tomato")
      .style("font-weight", "bold")
      .text(text);
  const resetStyle = (
    selection,
    text,
    fill = "teal",
    delay = 1000,
    duration = 100
  ) =>
    selection
      .transition()
      .delay(delay)
      .duration(duration)
      .style("color", fill)
      .style("font-weight", "normal")
      .text(text);

  const getElementPosition = (el) => el.node().getBoundingClientRect();

  const stepToInitValue = (isFirstIteration) => {
    if (isFirstIteration) {
      const selfPos = getElementPosition(initialValue);
      const accArg1Pos = getElementPosition(accArg1);

      initialValue
        .call(activeStyle, initialValue.text())
        .clone(true)
        .style("position", "absolute")
        .style("left", `${selfPos.x}px`)
        .style("opacity", 1)
        .style("color", "tomato")
        .style("font-weight", "bold")
        .transition()
        .delay(2000)
        .style("left", `${accArg1Pos.left}px`)
        .style("top", `${accArg1Pos.top}px`)
        .duration(2000)
        .style("opacity", 0.1)
        .remove();
    } else {
      initialValue.call(resetStyle, initialValue.text());
    }
  };

  const resetArrayItemsStyle = () =>
    items
      .transition()
      .style("color", "teal")
      .style("font-weight", "normal")
      .end();

  const stepToCurrentArrayItem = (node, itemIndex, stepNumber) => {
    const selfPos = getElementPosition(node);
    const itemArg1Pos = getElementPosition(itemArg1);

    resetArrayItemsStyle();

    node
      .call(activeStyle, node.text(), stepNumber * 2000)
      .clone(true)
      .style("position", "absolute")
      .style("left", `${selfPos.left}px`)
      .text(node.text())
      .style("color", "tomato")
      .style("font-weight", "bold")
      .style("visibility", "hidden")
      .style("opacity", 1)
      .transition()
      .style("visibility", "visible")
      .style("opacity", 0.1)
      .delay(stepNumber * 2000)
      .duration(2000)
      .style("left", `${itemArg1Pos.left}px`)
      .style("top", `${itemArg1Pos.top}px`)
      .remove();
  };

  const stepToArg = (selection, newText, resetText, stepNumber, ctx = {}) => {
    const sourcePos = getElementPosition(selection);
    const destPos = getElementPosition(
      selection === accArg1 ? accArg2 : itemArg2
    );

    const node = selection
      .call(activeStyle, newText, stepNumber * 2000)
      .call(resetStyle, resetText, "skyblue", stepNumber * 3000);

    if (selection === accArg1 || selection === itemArg1) {
      const itemArg1CloneLeftOffset =
        (accArg1.text().length - `${ctx.accumulatedValue}`.length) *
        items.nodes()[0].getBoundingClientRect().width;
      const sourceCloneOffset =
        selection === itemArg1 ? itemArg1CloneLeftOffset : 0;

      node
        .clone(true)
        .style("position", "absolute")
        .style("left", `${sourcePos.left - sourceCloneOffset}px`)
        .text(newText)
        .style("color", "tomato")
        .style("font-weight", "bold")
        .style("visibility", "hidden")
        .style("opacity", 0)
        .transition()
        .delay(stepNumber * 1000)
        .style("opacity", 1)
        .transition()
        .delay(stepNumber * 1000)
        .duration(stepNumber * 1000)
        .style("opacity", 0.1)
        .style("visibility", "visible")
        .style("left", `${destPos.left}px`)
        .style("top", `${destPos.top}px`)
        .remove();
    }
  };

  const stepToNewAccumulatedValue = (newAcc, stepNumber, isLastIteration) => {
    const accEquationPos = getElementPosition(accEquation);
    const calculatedAccPos = getElementPosition(calculatedAcc);
    const accArg1Pos = getElementPosition(accArg1);
    const defaultFontSize = 16;
    const maxFontSize = defaultFontSize * 5;

    accEquation
      .transition()
      .delay(stepNumber * 2000)
      .duration(isLastIteration ? 4000 : 3000)
      .style("visibility", "hidden")
      .transition()
      .style("visibility", "visible");

    calculatedAcc
      .style("left", `${accEquationPos.left + 8}px`)
      .style("top", `${accEquationPos.top - 8}px`)
      .transition()
      .delay(stepNumber * 2000)
      .style("opacity", 0.7)
      .duration(isLastIteration ? 1000 : 2000)
      .style("opacity", 1)
      .style("visibility", "visible")
      .text(newAcc)
      .transition()
      .duration(isLastIteration ? 3000 : 2000)
      .style(
        "left",
        `${isLastIteration ? accEquationPos.left : accArg1Pos.left}px`
      )
      .style(
        "top",
        `${
          isLastIteration
            ? accEquationPos.top - maxFontSize / 2
            : accArg1Pos.top
        }px`
      )
      .style(
        "font-size",
        `${isLastIteration ? maxFontSize : defaultFontSize}px`
      )
      .style("opacity", isLastIteration ? 1 : 0.1)
      .transition()
      .style("font-size", `${defaultFontSize * 2}px`)
      .style("left", `${accEquationPos.left + 8}px`)
      .style("top", `${accEquationPos.top - 8}px`)
      .style("visibility", "hidden");

    if (isLastIteration) {
      resetArrayItemsStyle();
    } else {
      accArg1.call(activeStyle, newAcc, (stepNumber + 2) * 2000);
    }
  };

  const step = async () => {
    let accumulatedValue = parseInt(initialValue.text());
    const iterationStepCount = 4;

    items.each(async function (_, i) {
      const currentItem = select(this);
      const isFirstIteration = i === 0;
      const isLastIteration = i === items.size() - 1;

      await sleep(i * iterationStepCount * 2);

      stepToInitValue(isFirstIteration);
      stepToCurrentArrayItem(currentItem, i, 1);
      stepToArg(accArg1, accumulatedValue, "acc", 2);
      stepToArg(itemArg1, currentItem.text(), "item", 2, { accumulatedValue });
      stepToArg(accArg2, accumulatedValue, "acc", 3);
      stepToArg(itemArg2, currentItem.text(), "item", 3, { accumulatedValue });

      accumulatedValue = accumulatedValue + parseInt(currentItem.text());

      stepToNewAccumulatedValue(accumulatedValue, 4, isLastIteration);

      if (isLastIteration) {
        await sleep(iterationStepCount * 3);
        step();
      }
    });
  };

  step();
});
