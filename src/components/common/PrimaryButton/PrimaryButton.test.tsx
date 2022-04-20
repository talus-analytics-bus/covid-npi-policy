import React from 'react';
import ReactDOM from 'react-dom';
import { fireEvent, render, screen } from "@testing-library/react"
import PrimaryButton from './PrimaryButton';


it('responds to clicking', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    render(<PrimaryButton label={"Click"} onClick={() => alert('clicked')} />)
    fireEvent.click(screen.getByText('Click'))
    expect(alertMock).toHaveBeenCalledTimes(1)
    alertMock.mockReset()
})
it('cannot be clicked if disabled', () => {
    // TODO fix so component not reliant on SCSS for "disabled" feature
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    render(<PrimaryButton disabled label={"Click"} onClick={() => alert('clicked')} />)
    fireEvent.click(screen.getByText('Click'))
    expect(alertMock).toHaveBeenCalledTimes(0)
    alertMock.mockReset()
})

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<PrimaryButton label={"Dismiss"} />, div);
    ReactDOM.unmountComponentAtNode(div);
});
