import React, { CSSProperties } from "react";
import { ui } from "../common/ui";
import { Suggestion } from "../models/autocomplete.types";

interface AutocompleteItemProps {
  onClick?: (suggestion: Suggestion) => void;
  config: HyperAutocompleteConfig;
  suggestion: Suggestion;
}

interface AutocompleteItemState {
  icon?: IconComponent | undefined;
}

export class AutocompleteItemComponent extends React.PureComponent<
  AutocompleteItemProps,
  AutocompleteItemState
> {
  public static ITEM_HEIGHT_PX = 30;

  constructor(props: AutocompleteItemProps) {
    super(props);
    this.state = {
      icon: undefined
    };

    this.updateIcon = this.updateIcon.bind(this);
    this.getIcon = this.getIcon.bind(this);
    this.updateIcon(props.suggestion);
  }

  componentDidUpdate(prevSugg: AutocompleteItemProps) {
    const { label } = this.props.suggestion;
    if (prevSugg.suggestion.label !== label) {
      this.updateIcon(this.props.suggestion);
    }
  }

  updateIcon = (suggestion: Suggestion) => {
    this.getIcon(suggestion).then(icon => {
      this.setState({ icon });
    });
  };

  async getIcon({ label, kind }: Suggestion) {
    return await ((kind === "Directory" &&
      ui.getIconForFolder(label, "dark")) ||
      (kind === "File" && ui.getIconForFile(label, "dark")) ||
      undefined);
  }

  render() {
    const { onClick, suggestion, config } = this.props;
    const wrapperStyle = {
      lineHeight: `${AutocompleteItemComponent.ITEM_HEIGHT_PX}px`,
      minHeight: `${AutocompleteItemComponent.ITEM_HEIGHT_PX}px`
    } as CSSProperties;
    const Icon = this.state.icon;
    return (
      <div
        onClick={() => onClick(suggestion)}
        className={"autocomplete-item"}
        style={wrapperStyle}
      >
        <div className={"autocomplete-item-row"}>
          {Icon && <Icon style={{ marginRight: 10, width: 15, height: 15 }} />}
          <span style={{ ...config.label, marginRight: 10 }}>
            {suggestion.highlightLabel || suggestion.label}
          </span>
        </div>
        {suggestion.detail && (
          <span
            style={{
              ...config.detail
            }}
          >
            {suggestion.detail}
          </span>
        )}
      </div>
    );
  }
}
