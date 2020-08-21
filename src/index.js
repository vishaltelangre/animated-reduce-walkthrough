import { select, selectAll, transition } from "d3";

document.addEventListener("DOMContentLoaded", () => {
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

  const stepToInitValue = (isFirstIteration) => {
    if (isFirstIteration) {
      initialValue
        .call(activeStyle, initialValue.text())
        .clone(true)
        .attr("fill", "tomato")
        .attr("font-weight", "bold")
        .attr("dx", -10)
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("dx", 100)
        .attr("dy", 78)
        .remove();
    } else {
      initialValue.call(resetStyle, initialValue.text());
    }
  };

  const stepToCurrentArrayItem = (items, node, itemIndex, stepNumber) => {
    const elementXPos = (el) => el.node().getBoundingClientRect().left - 104;
    const currentItemXPos = elementXPos(node);
    const itemArg1XPos = elementXPos(itemArg1);

    items
      .transition()
      .attr("fill", "teal")
      .attr("font-weight", "normal")
      .end();

    node
      .call(activeStyle, node.text(), stepNumber * 1000)
      .select(function () {
        return this.parentNode.parentNode;
      })
      .insert("text", ":first-child")
      .attr("x", currentItemXPos)
      .text(node.text())
      .attr("fill", "tomato")
      .attr("font-weight", "bold")
      .style("visibility", "hidden")
      .transition()
      .style("visibility", "visible")
      .delay(stepNumber * 1000)
      .duration(1000)
      .attr("x", itemArg1XPos)
      .attr("dy", 38)
      .remove();
  };

  const stepToArg = (selection, newText, resetText, stepNumber) => {
    selection
      .call(activeStyle, newText, stepNumber * 1000)
      .call(resetStyle, resetText, "skyblue", (stepNumber + 1) * 1000);
  };

  const stepToNewAccumulatedValue = (newAcc, stepNumber, isLastIteration) => {
    accEquation
      .transition()
      .delay(stepNumber * 1000)
      .duration(isLastIteration ? 3000 : 2000)
      .style("visibility", "hidden")
      .transition()
      .style("visibility", "visible");

    calculatedAcc
      .transition()
      .delay(stepNumber * 1000)
      .duration(1000)
      .style("visibility", "visible")
      .text(newAcc)
      .transition()
      .attr("dx", isLastIteration ? 0 : 166)
      .attr("dy", isLastIteration ? 20 : -60)
      .attr("font-size", isLastIteration ? 80 : 16)
      .duration(isLastIteration ? 2000 : 1000)
      .transition()
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("font-size", 40)
      .style("visibility", "hidden");

    if (!isLastIteration) {
      accArg1.call(activeStyle, newAcc, (stepNumber + 2) * 1000);
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
      stepToCurrentArrayItem(items, currentItem, i, 1);
      stepToArg(accArg1, accumulatedValue, "acc", 2);
      stepToArg(itemArg1, currentItem.text(), "item", 2);
      stepToArg(accArg2, accumulatedValue, "acc", 3);
      stepToArg(itemArg2, currentItem.text(), "item", 3);

      accumulatedValue = accumulatedValue + parseInt(currentItem.text());

      stepToNewAccumulatedValue(accumulatedValue, 4, isLastIteration);

      if (isLastIteration) {
        await sleep(iterationStepCount * 2);
        step();
      }
    });
  };

  step();
});
