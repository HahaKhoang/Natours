/* eslint-disable*/

const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email: email,
        password,
      },
    });

    if (result.data.status === 'success') {
      alert('Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log(result);
  } catch (error) {
    alert(error.response.data.message);
  }
};

document
  .querySelector('.form')
  .addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
