(function () {
    /*
    * Secondary functions
    * */
    function ajax(params) {
        var xhr = new XMLHttpRequest();
        var url = params.url || '';
        var body = params.body || '';
        var success = params.success;
        var error = params.error;

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(body);
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200 && typeof success === 'function') {
                success(xhr.response);
            } else if (xhr.readyState === 4 && xhr.status !== 200 && typeof error === 'function') {
                error(xhr.response);
            }
        };
        xhr.onerror = error || null;
    }

    /*
    * Validation
    * */
    function checkRegExp(pattern, message, value) {
        return pattern.test(value) ? true : message;
    }

    function checkConfirmPasswordField(value) {
        var passwordValue = document.getElementById('password').value;
        if (value === '' && value === passwordValue) {
            return 'Required at least one number (0-9), uppercase and lowercase letters (a-Z) and at least one special character (!@#$%^&*-)';
        } else if ((value || passwordValue) && value !== passwordValue) {
            return 'Must be to equal to Password';
        }

        return true;
    }

    var validations = {
        firstName: [
            checkRegExp.bind(null, /^[A-Zа-я]{2,}$/i, 'Field may contain only letters and not be less than 2 letters'),
            checkRegExp.bind(null, /^[A-Zа-я]{2,64}$/i, 'Field may contain only letters and not be more than 64 letters'),
        ],
        lastName: [
            checkRegExp.bind(null, /^[A-Zа-я]{2,}$/i, 'Field may contain only letters and not be less than 2 letters'),
            checkRegExp.bind(null, /^[A-Zа-я]{2,64}$/i, 'Field may contain only letters and not be more than 64 letters'),
        ],
        email: [
            checkRegExp.bind(null,
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please enter valid email'),
        ],
        phone: [
            checkRegExp.bind(null, /^[0-9]{8}$/, 'Field may contain only 8 digits'),
        ],
        password: [
            checkRegExp.bind(null,
                /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\!\@\#\$\%\^\&\*\-])/,
                'Required at least one number (0-9), uppercase and lowercase letters (a-Z) and at least one special character (!@#$%^&*-)'),
        ],
        password2: [
            checkConfirmPasswordField.bind(null),
        ],
        zip: [
            checkRegExp.bind(null, /^[0-9]{5}$/, 'Field must include 5 digits and only consist of numeric values'),
        ]
    };

    function validateField(element) {
        var fieldValidation = validations[element.id];
        var result = { valid: true, element: element, message: '' };

        if (fieldValidation) {
            for (var i = 0, len = fieldValidation.length; i < len; i++) {
                var validationFunction = fieldValidation[i];
                var answer = validationFunction(element.value);
                if (typeof answer === 'string') {
                    result.valid = false;
                    result.message = answer;
                    break;
                }
            }
        }

        return result;
    }

    /*
    * Other function
    * */
    function toggleError(element, message) {
        var errorMessageElement = element.nextElementSibling && element.nextElementSibling.classList.contains('field-error')
            ? element.nextElementSibling
            : null;

        errorMessageElement && message && (errorMessageElement.innerHTML = message);
        errorMessageElement && !message && (errorMessageElement.innerHTML = '');
    }
    function formOnchange(e) {
        if (e.target.dataset && e.target.dataset.validation !== undefined) {
            toggleError(e.target, validateField(e.target).message);
        }
    }

    function toggleSteps() {
        var elements = document.getElementsByClassName('step');
        var btns = document.getElementsByClassName('control');
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].classList.contains('step_active')) {
                elements[i].classList.remove('step_active');
            } else {
                elements[i].classList.add('step_active');
            }
        }
        for (var j = 0; j < btns.length; j++) {
            if (btns[j].classList.contains('control_hide')) {
                btns[j].classList.remove('control_hide');
            } else {
                btns[j].classList.add('control_hide');
            }
        }
    }

    function chechBefore() {
        var errors = [];
        for (var el in validations) {
            var target = document.getElementById(el);
            var field = validateField(target);
            if (!field.valid && el !== 'zip') {
                errors.push(field.message);
                toggleError(target, field.message)
            }  
        }
        
        if (!errors.length) {
            toggleSteps();
        } 
    }

    function checkBeforeSubmit(e) {
        var target = document.getElementById('zip');
        var field = validateField(target);
        if (!field.valid) {
            e.preventDefault();
            toggleError(target, field.message);
        } 
    }

    function zip() {
        var params = {
            url: 'http://localhost/api/geoStatus.php',
            body: 'zip=' + document.getElementById('zip').value,
            success: success,
            error: error
        };

        ajax(params);
    }

    function success(resp) {
        if (resp === 'allowed') {
            var params = {
                url: 'http://localhost/api/geoData.php',
                body: 'zip=' + document.getElementById('zip').value,
                success: parseResp,
                error: error
            }

            ajax(params);
        } else if (resp === 'blocked') {
            error(resp);
        }
    }

    function error(resp) {
        document.getElementById('zip').value = '';
        document.getElementById('state').value = '';
        document.getElementById('city').value = '';
        alert(resp);
    }

    function parseResp(resp) {
        if (resp !== 'error') {
            var parse = JSON.parse(resp);
            document.getElementById('state').value = parse.state;
            document.getElementById('city').value = parse.city;
        } else {
            error(resp);
        }
    }

    /*
    * Listeners
    * */
    document.getElementById('mainForm').addEventListener('change', formOnchange);
    document.getElementById('zip').addEventListener('change', zip);
    document.querySelector('.control_next').addEventListener('click', chechBefore);
    document.querySelector('.control_prev').addEventListener('click', toggleSteps);
    document.querySelector('.control_submit').addEventListener('click', checkBeforeSubmit);
})();
