import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PropTypes from 'prop-types';

const BtnP = styled.p.attrs({
  className: 'btn',
})``;

const ButtonItem = ({ title, btnClick, icon }) => {
  return (
    <BtnP onClick={btnClick}>
      <FontAwesomeIcon icon={icon} />
      <span className="px-2">{title}</span>
    </BtnP>
  );
};

export default ButtonItem;
