import React from 'react';
import ReactDOM from 'react-dom';
import "@"
import PrimaryButton from './PrimaryButton';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<PrimaryButton label={"Dismiss"} />, div);
    ReactDOM.unmountComponentAtNode(div);
});
