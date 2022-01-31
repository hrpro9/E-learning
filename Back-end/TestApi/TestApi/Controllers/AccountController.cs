using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace TestApi.Controllers
{
    public class AccountController : Controller
    {
        TestApiEntities2 db = new TestApiEntities2();
        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Login(User model)
        {
            
            using (var context = new TestApiEntities2())
            {
                bool isValidUser = context.Users.Any(c => c.ID == model.ID && c.Nom == model.Nom);

                if (isValidUser)
                {
                    FormsAuthentication.SetAuthCookie(model.ID, false);
                    return RedirectToAction("Index", "Home");
                }

                ModelState.AddModelError("", "Invalid username and password");
                return View();
            }
        }

    }
}