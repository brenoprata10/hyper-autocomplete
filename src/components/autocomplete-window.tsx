import React from 'react';
import { AutocompleteItemComponent } from './autocomplete-item';

interface AutocompleteWindowProps {
  padding: number;
  suggestions: Suggestion[];
  backgroundColor: string;
}

export class AutocompleteWindow extends React.PureComponent<
  AutocompleteWindowProps
> {
  state: {
    position: CursorPosition;
    terminalWidth: number;
    terminalHeight: number;
  };

  private static MAX_HEIGHT_PX = 150;

  constructor(props: AutocompleteWindowProps) {
    super(props);
    this.state = {
      terminalWidth: 0,
      terminalHeight: 0,
      position: {
        x: 0,
        y: 0,
        width: 8,
        height: 8,
        col: 8,
        row: 8
      }
    };
  }

  render() {
    return this.props.suggestions.length < 1 ? (
      <div />
    ) : (
      <div
        style={{
          position: 'absolute',
          padding: this.props.padding,
          zIndex: 4,
          ...this.calcPosition()
        }}
      >
        <div
          style={{
            maxHeight: AutocompleteWindow.MAX_HEIGHT_PX + 'px',
            color: 'white',
            width: '300px',
            border: '1px solid white',
            display: 'flex',
            overflowX: 'hidden',
            overflowY: 'scroll',
            backgroundColor: this.props.backgroundColor,
            boxShadow:
              '0 4px 8px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.08)',
            flexDirection: this.shouldInvert() ? 'column-reverse' : 'column'
          }}
        >
          {this.props.suggestions.map(item => (
            <AutocompleteItemComponent suggestion={item} />
          ))}
        </div>
      </div>
    );
  }

  getItemsHeight() {
    return Math.min(
      AutocompleteWindow.MAX_HEIGHT_PX,
      this.props.suggestions.length * AutocompleteItemComponent.ITEM_HEIGHT_PX
    );
  }

  getTerminalPositionTop() {
    return this.state.position.y + this.state.position.height;
  }

  shouldInvert() {
    return (
      this.state.terminalHeight <
      this.getTerminalPositionTop() + this.getItemsHeight() + 15
    );
  }

  calcPosition() {
    const totalHeight = this.getItemsHeight();
    return {
      top: this.shouldInvert()
        ? this.state.position.y - totalHeight
        : this.state.position.y + this.state.position.height,
      left: this.state.position.x + this.state.position.width
    };
  }
}
