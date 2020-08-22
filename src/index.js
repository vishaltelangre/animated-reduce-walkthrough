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
      .attr("fill", "tomato")
      .attr("font-weight", "bold")
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
      .attr("fill", fill)
      .attr("font-weight", "normal")
      .text(text);

  const getElementPosition = (el) => {
      const ownerSVGRect = el.node().ownerSVGElement.getBoundingClientRect();
      const elRect = el.node().getBoundingClientRect();
      return { x: elRect.x - ownerSVGRect.x, y: elRect.y - ownerSVGRect.y };
    }

  const stepToInitValue = (isFirstIteration) => {
    if (isFirstIteration) {
      initialValue
        .call(activeStyle, initialValue.text())
        .clone(true)
        .style("opacity", 1)
        .attr("fill", "tomato")
        .attr("font-weight", "bold")
        .attr("dx", -10)
        .transition()
        .delay(2000)
        .duration(2000)
        .attr("dx", 100)
        .attr("dy", 78)
        .style("opacity", 0.1)
        .remove();
    } else {
      initialValue.call(resetStyle, initialValue.text());
    }
  };

  const resetArrayItemsStyle = () => items
      .transition()
      .attr("fill", "teal")
      .attr("font-weight", "normal")
      .end();

  const stepToCurrentArrayItem = (node, itemIndex, stepNumber) => {
    const currentItemPos = getElementPosition(node);
    const itemArg1Pos = getElementPosition(itemArg1);

    resetArrayItemsStyle();

    node
      .call(activeStyle, node.text(), stepNumber * 2000)
      .select(function () {
        return this.parentNode.parentNode;
      })
      .insert("text", ":first-child")
      .attr("dx", currentItemPos.x)
      .attr("dy", 0)
      .text(node.text())
      .attr("fill", "tomato")
      .attr("font-weight", "bold")
      .style("visibility", "hidden")
      .style("opacity", 1)
      .transition()
      .style("visibility", "visible")
      .style("opacity", 0.1)
      .delay(stepNumber * 2000)
      .duration(2000)
      .attr("dx", itemArg1Pos.x)
      .attr("dy", itemArg1Pos.y - currentItemPos.y)
      .remove();
  };

  const stepToArg = (selection, newText, resetText, stepNumber) => {
    const sourcePos = getElementPosition(selection);
    const destPos = getElementPosition(selection === accArg1 ? accArg2 : itemArg2);

    const node = selection
      .call(activeStyle, newText, stepNumber * 2000)
      .call(resetStyle, resetText, "skyblue", stepNumber * 3000);

    if (selection === accArg1 || selection === itemArg1) {
      node
        .select(function () {
          return this.parentNode.parentNode;
        })
        .insert("text", ":first-child")
        .attr("dx", sourcePos.x)
        .attr("dy", 0)
        .text(newText)
        .attr("fill", "tomato")
        .attr("font-weight", "bold")
        .style("visibility", "hidden")
        .style("opacity", 0)
        .transition()
        .delay(stepNumber * 1000)
        .style("opacity", 0.5)
        .transition()
        .delay(stepNumber * 1000)
        .duration(stepNumber * 1000)
        .style("opacity", 0.1)
        .style("visibility", "visible")
        .attr("dx", destPos.x)
        .attr("dy", destPos.y - sourcePos.y)
        .remove();
    }
  };

  const stepToNewAccumulatedValue = (newAcc, stepNumber, isLastIteration) => {
    accEquation
      .transition()
      .delay(stepNumber * 2000)
      .duration(isLastIteration ? 4000 : 3000)
      .style("visibility", "hidden")
      .transition()
      .style("visibility", "visible");

    calculatedAcc
      .transition()
      .delay(stepNumber * 2000)
      .style("opacity", 0.7)
      .duration(isLastIteration ? 1000 : 2000)
      .style("opacity", 1)
      .style("visibility", "visible")
      .text(newAcc)
      .transition()
      .duration(isLastIteration ? 3000 : 2000)
      .attr("dx", isLastIteration ? 0 : 145)
      .attr("dy", isLastIteration ? 20 : -60)
      .attr("font-size", isLastIteration ? 80 : 16)
      .style("opacity", isLastIteration ? 1 : 0.1)
      .transition()
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("font-size", 32)
      .style("visibility", "hidden");

    if (isLastIteration) {
      resetArrayItemsStyle();
    }
    else {
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
      stepToArg(itemArg1, currentItem.text(), "item", 2);
      stepToArg(accArg2, accumulatedValue, "acc", 3);
      stepToArg(itemArg2, currentItem.text(), "item", 3);

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
