import React, { CSSProperties } from "react";
import { ui } from "../common/ui";
import { Suggestion } from "../models/autocomplete.types";

interface AutocompleteItemProps {
  onClick?: () => void;
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
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "5px",
      lineHeight: AutocompleteItemComponent.ITEM_HEIGHT_PX + "px",
      minHeight: AutocompleteItemComponent.ITEM_HEIGHT_PX + "px",
      whiteSpace: "nowrap",
      textOverflow: "hidden"
    } as CSSProperties;
    const rowStyle = { display: "flex", alignItems: "center" };
    const Icon = this.state.icon;
    return (
      <div onClick={onClick} style={wrapperStyle}>
        <div style={rowStyle}>
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
