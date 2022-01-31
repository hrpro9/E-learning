using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TestApi.Models
{
    public class UserSecurety
    {
        public static bool Login(string username, string password)
        {
            using (TestApiEntities2 entities = new TestApiEntities2())
            {
                return entities.Users.Any(user =>
                       user.UserName.Equals(username, StringComparison.OrdinalIgnoreCase)
                                          && user.Password == password);
            }
        }
    }
}