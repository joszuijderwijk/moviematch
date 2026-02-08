import React, { useEffect, useRef, useState } from "react";
import {
  useCombobox,
  UseComboboxGetItemPropsOptions,
  useMultipleSelection,
  UseMultipleSelectionGetDropdownProps,
} from "downshift";
import { usePopper } from "react-popper";

import type { FilterValue } from "../../../../../types/moviematch";
import { Pill } from "../atoms/Pill";

import styles from "./AutoSuggestInput.module.css";

interface AutoSuggestInputProps {
  inputName: string;
  items: FilterValue[];
  value: FilterValue[];
  onChange: (value: FilterValue[]) => void;
}

export const AutoSuggestInput = ({
  inputName,
  items,
  onChange,
  value,
}: AutoSuggestInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const inputValueRef = useRef<string>("");
  
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);
  
  const {
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({ defaultSelectedItems: value });
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLDivElement | null>();
  const [popperElement, setPopperElement] = useState<HTMLUListElement | null>();

  const { styles: popperStyles, attributes, update: updatePopper } = usePopper(
    referenceElement,
    popperElement,
    {
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 10],
          },
        },
      ],
    },
  );

  useEffect(() => {
    onChange(selectedItems);
  }, [selectedItems]);

  const filteredItems = items.filter(
    (item) =>
      !selectedItems.includes(item) &&
      item.title.toLowerCase().startsWith(inputValue.toLowerCase()),
  );

  const {
    isOpen,
    openMenu,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    inputValue,
    selectedItem: null,
    items: filteredItems,
    stateReducer: (_state, { changes, type }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
          return {
            ...changes,
            isOpen: false, // Close menu when Enter is pressed
          };
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true,
          };
      }
      return changes;
    },
    onStateChange: ({ inputValue: newInputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(newInputValue ?? "");
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
          if (selectedItem) {
            addSelectedItem(selectedItem);
            setInputValue("");
          } else {
            const currentValue = inputValueRef.current.trim();
            if (currentValue !== "") {
              const manualItem: FilterValue = {
                title: currentValue,
                value: currentValue,
              };
              addSelectedItem(manualItem);
              setInputValue("");
            }
          }
          break;
        case useCombobox.stateChangeTypes.ItemClick:
          if (selectedItem) {
            addSelectedItem(selectedItem);
            setInputValue("");
          }
          break;
        case useCombobox.stateChangeTypes.InputBlur:
          // Commit typed value on blur so clicking "Create Room" doesn't lose it
          {
            const currentValue = inputValueRef.current.trim();
            if (currentValue !== "") {
              const manualItem: FilterValue = {
                title: currentValue,
                value: currentValue,
              };
              addSelectedItem(manualItem);
              setInputValue("");
            }
          }
          break;
        default:
          break;
      }

      if (updatePopper) {
        updatePopper();
      }
    },
  });

  return (
    <>
      <div {...getComboboxProps({ className: styles.container })}>
        <div className={styles.selections}>
          {selectedItems.map((selectedItem, index) => (
            <React.Fragment
              key={`selected-item-${selectedItem.value}`}
            >
              {index !== 0 && (
                <span
                  className={styles.selectionsDelimiterLabel}
                >
                  or
                </span>
              )}
              <Pill
                onRemove={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(selectedItem);
                }}
              >
                {selectedItem.title}
              </Pill>
            </React.Fragment>
          ))}
          <input
            {...getInputProps(
              getDropdownProps({
                preventKeyAction: isOpen,
                className: styles.input,
                name: inputName,
                ref: (el: HTMLInputElement | null) => {
                  if (el instanceof HTMLInputElement) {
                    setReferenceElement(el);
                  }
                },
                onFocus: () => {
                  if (!isOpen) {
                    openMenu();
                  }
                },
                "data-test-handle": inputName + "-autosuggest-input",
              } as UseMultipleSelectionGetDropdownProps),
            )}
          />
        </div>
      </div>
      <ul
        {...getMenuProps({
          ...attributes.popper,
          ref: (menuEl) => {
            if (menuEl instanceof HTMLUListElement) {
              setPopperElement(menuEl);
            }
          },
          style: {
            ...popperStyles.popper,
            display: isOpen && filteredItems.length !== 0 ? "block" : "none",
          },
          className: styles.suggestions,
        })}
      >
        <div
          data-popper-arrow
          className={styles.suggestionsArrow}
          style={popperStyles.arrow}
          {...attributes.arrow}
        >
        </div>
        <div
          className={styles.suggestionsScrollBox}
          data-test-handle={inputName + "-suggestions"}
        >
          {filteredItems.map((item, index) => (
            <li
              {...getItemProps({
                item,
                index,
                className: index === highlightedIndex
                  ? styles.highlightedSuggestion
                  : styles.suggestion,
                key: `${item.value}${index}`,
                "data-test-handle": `${inputName}-suggestion-${item.title}`,
              } as UseComboboxGetItemPropsOptions<FilterValue>)}
            >
              {item.title}
            </li>
          ))}
        </div>
      </ul>
    </>
  );
};
