import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import classNames from 'classnames';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TabUl = styled.ul.attrs({
  className: 'nav nav-pills',
})`
border-bottom: 1px solid #fff;
  li a {
    color: #fff;
    border-radius: 0 !important;
  }
  li a.active {
    background-color: #3e403f !important;
  }
  .nav-link.unSavaMark .rounded-circle {
    display: inline-block;
    width: 11px;
    height: 11px;
    background-color: #b80233;
  }
  .nav-link.unSavaMark .icon-close {
    display: none;
  }
  .nav-link.unSavaMark:hover .icon-close {
    display: inline-block;
  }
  .nav-link.unSavaMark:hover .rounded-circle {
    display: none;
  }
`;

const TabList = ({ files, activeItem, unSavaItems, clickItem, closeItem }) => {
  return (
    <TabUl>
      {files.map((file) => {
        let unSavaMark = unSavaItems.includes(file.id);

        let finalClass = classNames({
          'nav-link': true,
          active: activeItem === file.id,
          "unSavaMark": unSavaMark
        });
        return (
          <li className="nav-item" key={file.id}>
            <a
              href="#"
              className={finalClass}
              onClick={(e) => {
                e.preventDefault();
                clickItem(file.id);
              }}
            >
              {file.title}
              <span
                className="ml-2 icon-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeItem(file.id);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </span>
              {unSavaMark && <span className="ml-2 rounded-circle"></span>}
            </a>
          </li>
        );
      })}
    </TabUl>
  );
};

TabList.propTypes = {
  files: PropTypes.array,
  activeItem: PropTypes.string,
  unSavaItems: PropTypes.array,
  clickItem: PropTypes.func,
  closeItem: PropTypes.func,
};

TabList.defaultProps = {
  unSavaItems: [],
};

export default TabList;
