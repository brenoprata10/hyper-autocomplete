import React from "react";
import { AutocompleteItemComponent } from "./autocomplete-item";
import { Suggestion } from "../models/autocomplete.types";
import { CursorPosition } from "../models/cursor-position.types";

interface AutocompleteWindowProps {
  config: HyperAutocompleteConfig;
  suggestions: Suggestion[];
  terminalHeight: number;
  terminalWidth: number;
  position: CursorPosition;
  padding: number;
}

export class AutocompleteWindow extends React.PureComponent<
  AutocompleteWindowProps
> {
  private static MAX_HEIGHT_PX = 150;

  render() {
    const { suggestions, padding, config } = this.props;
    console.log({ props: this.props });
    if (suggestions.length < 1) {
      return <div />;
    }
    return (
      <div
        style={{
          position: "absolute",
          padding: padding,
          zIndex: 4,
          ...this.calcPosition()
        }}
      >
        <div
          style={{
            maxHeight: AutocompleteWindow.MAX_HEIGHT_PX + "px",
            color: "white",
            display: "flex",
            overflowX: "hidden",
            overflowY: "scroll",
            backgroundColor: config.backgroundColor,
            boxShadow:
              "rgba(0, 0, 0, 0.12) 0px 0px 10px 3px, rgba(0, 0, 0, 0.08) 1px 4px 5px 2px",
            flexDirection: this.shouldInvert() ? "column-reverse" : "column"
          }}
        >
          {suggestions.map(item => (
            <AutocompleteItemComponent
              key={item.label}
              config={config}
              suggestion={item}
            />
          ))}
        </div>
      </div>
    );
  }

  getItemsHeight() {
    const { suggestions } = this.props;
    return Math.min(
      AutocompleteWindow.MAX_HEIGHT_PX,
      suggestions.length * AutocompleteItemComponent.ITEM_HEIGHT_PX
    );
  }

  getTerminalPositionTop() {
    const { position } = this.props;
    const { y, height } = position;
    return y + height;
  }

  shouldInvert() {
    const { terminalHeight } = this.props;
    return (
      terminalHeight <
      this.getTerminalPositionTop() + this.getItemsHeight() + 15
    );
  }

  calcPosition() {
    const { position } = this.props;
    const { y, x, height, width } = position;
    const totalHeight = this.getItemsHeight();
    return {
      top: this.shouldInvert() ? y - totalHeight : y + height,
      left: x + width
    };
  }
}
