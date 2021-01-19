import axios from 'axios';

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);

  return <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async () => {
  if (typeof window === 'undefined') {
    // we are on the server
    // request should be made to the ingress kube fqdn
    const { data } = await axios.get(
      'http://ingress-nginx-controller.kube-system.svc/api/users/currentuser',
      {
        headers: {
          Host: 'bakerscraft.com',
        },
      }
    );

    return data;
  } else {
    // we are on the broser!
    // request can be made with a base url of ''
    const { data } = await axios.get('/api/users/currentuser');

    return data;
  }

  return {};
};

export default LandingPage;
