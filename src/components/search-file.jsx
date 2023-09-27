import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import useKeyHandler from '../hooks/useKeyHandler';
import useIpcRenderer from '../hooks/useIpcRenderer';

let SearchDiv = styled.div`
  border-bottom: 1px solid #fff;
  span {
    color: #fff;
    padding: 0 10px;
    font: normal 16px/40px '微软雅黑';
  }

  input {
    border: none;
    border-radius: 4px;
    margin-left: 10px;
  }
`;

const SearchFile = ({ title, onSearch }) => {
  const [searchActive, setSearchActive] = useState(false);
  const [value, setValue] = useState('');
  const enterPressed = useKeyHandler(13);
  const escPressed = useKeyHandler(27);

  const oInput = useRef(null);

  const closeSearch = () => {
    setSearchActive(false);
    setValue('');

    // 关闭搜索,提供一个空字符进行搜索
    onSearch('');
  };

  useEffect(() => {
    if (enterPressed && searchActive) {
      // enter
      onSearch(value);
    }

    if (escPressed && searchActive) {
      // esc
      closeSearch();
    }
  });

  useEffect(() => {
    if (searchActive) {
      oInput.current.focus();
    }
  }, [searchActive]);

  useIpcRenderer({
    'execute-search-file': () => {
      setSearchActive(true);
    },
  });

  return (
    <Fragment>
      {!searchActive && (
        <>
          <SearchDiv className="d-flex align-items-center justify-content-between">
            <span>{title}</span>
            <span
              onClick={() => {
                setSearchActive(true);
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </SearchDiv>
        </>
      )}
      {searchActive && (
        <>
          <SearchDiv className="d-flex align-items-center justify-content-between">
            <input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              ref={oInput}
            />
            <span
              onClick={() => {
                closeSearch();
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </span>
          </SearchDiv>
        </>
      )}
    </Fragment>
  );
};

SearchFile.propTypes = {
  title: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
};

SearchFile.defaultProps = {
  title: '文档列表',
};

export default SearchFile;
