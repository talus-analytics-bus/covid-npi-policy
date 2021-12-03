import styled from "styled-components";
export const FlexRow = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  > :not(:first-child) {
    margin-left: ${({ spacing }) => spacing ?? "0"};
  }
`;
