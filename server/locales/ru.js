module.exports = {
  translation: {
    appName: 'Менеджер задач',
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
      form: {
        firstname: 'Имя',
        lastname: 'Фамилия',
        email: 'Email',
        password: 'Пароль',
      },
      users: {
        new: {
          signUp: 'Регистрация',
          submit: 'Сохранить',
        },
        list: {
          id: 'ID',
          fullname: 'Полное имя',
          email: 'Email',
          dateCreated: 'Дата создания',
          edit: 'Изменить',
          delete: 'Удалить',
          submit: 'Создать',
        },
        edit: {
          edit: 'Изменение пользователя',
          submit: 'Изменить',
        },
      },
      status: {
        new: {
          create: 'Создание статуса',
          name: 'Наименование',
          submit: 'Создать',

        },
        list: {
          create: 'Создать статус',
          id: 'ID',
          name: 'Наименование',
          dateCreated: 'Дата создания',
          edit: 'Изменить',
          delete: 'Удалить',
        },
        edit: {
          edit: 'Изменение статуса',
          name: 'Наименование',
          submit: 'Изменить',
        },
      },
    },
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          error: 'Не удалось изменить пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Не удалось изменить удалить пользователя',
          success: 'Пользователь успешно удалён',
        },
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
        delete: {
          error: 'Не удалось изменить удалить статус',
          success: 'Статус успешно удалён',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
  },
};
