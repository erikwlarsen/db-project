import { PersonalInfo } from '../types';

export function PersonalInfoDisplay(props: { info: PersonalInfo }) {
  const { info } = props;
  return (
    <div>
      <p><b>First name: </b>{info.custFirstName}</p>
      <p><b>Middle initial: </b>{info.custMiddleInitial}</p>
      <p><b>Last name: </b>{info.custLastName}</p>
      <p><b>Suffix: </b>{info.custSuffix}</p>
      <p><b>SSN: </b>{info.custSsn}</p>
      <p><b>Date of birth: </b>{new Date(info.custDob).toLocaleDateString()}</p>
    </div>
  );
};
