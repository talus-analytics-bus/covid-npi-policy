import React from "react";
import { useEffect } from "react";
import styled from "styled-components";
import { AmpPage } from "types";

const useSetPageAndDisableLoading = (
  setPage: SetPage,
  setLoading: SetLoading
) => {
  useEffect(() => {
    setPage("policycoverage");
    setLoading(false);
  });
};

type SetPage = React.Dispatch<React.SetStateAction<AmpPage | null>>;
type SetLoading = React.Dispatch<React.SetStateAction<boolean>>;

interface PolicyCoverageProps {
  setPage: SetPage;
  setLoading: SetLoading;
}

const MapContainer = styled.div`
  position: relative;
  height: calc(100vh - 116px);
  top: 116px;
  width: 100%;
`;

const PolicyCoverage = ({ setPage, setLoading }: PolicyCoverageProps) => {
  useSetPageAndDisableLoading(setPage, setLoading);

  return (
    <MapContainer>
      <p>hi</p>
    </MapContainer>
  );
};

export default PolicyCoverage;
