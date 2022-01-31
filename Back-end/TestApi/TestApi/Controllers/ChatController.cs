using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace TestApi.Controllers
{
    public class ChatController : ApiController
    {
        TestApiEntities2 db = new TestApiEntities2();

        // GET: les Equips
        [Route("api/chats/{IdUser}")]
        public IEnumerable<dynamic> Get(string IdUser)
        {
            List<Conversation> conversations = new List<Conversation>();

            //add privat conversations and wich created by user
            conversations.AddRange(db.Conversations.Where(c => c.Type != "Conference" && c.Type != "Stream" && (c.IdUserCree == IdUser || c.IdUserContact == IdUser)));
            //add all conversations of equipes
            conversations.AddRange(db.Conversations.Where(c => c.Type != "Conference" && c.Type != "Stream" && c.Equip.Users.Any(u => u.ID == IdUser)));
            //add all conversations of groups
            conversations.AddRange(db.Conversations.Where(c => c.Type != "Conference" && c.Type != "Stream" && c.Group.Equips.Any(e => e.Users.Any(u => u.ID == IdUser))));

            return conversations.Distinct().Select(c => new
            {
                id = c.ID,
                name = c.Nom,
                type = c.Type,
                equip = c.IdEquip,
                group = c.IdGroup,
                userCree = c.IdUserCree,
                userContact = c.IdUserContact,
                lastMessage = c.LastMessage,
                lastMessageTime = c.LastMessageTime,
                c.hasStream,
                c.hasConference
            });
        }

        [Route("api/chat/{chatId}")]
        public dynamic GetChat(string chatId)
        {
            return db.Conversations.Select(c => new
            {
                id = c.ID,
                name = c.Nom,
                type = c.Type,
                equip = c.IdEquip,
                group = c.IdGroup,
                userCree = c.IdUserCree,
                userContact = c.IdUserContact,
                lastMessage = c.LastMessage,
                lastMessageTime = c.LastMessageTime,
                c.hasStream,
                c.streamId,
                c.hasConference,
                c.conferenceId,
                dialog = c.Messages.OrderBy(m => m.Time).Select(m => new { who = m.IdUser, message = m.Content, time = m.Time })
            })
                .SingleOrDefault(c => c.id == chatId);
        }

        // GET: les contacts
        [HttpGet]
        [Route("api/chat/Contacts/{IdUser}")]
        public IEnumerable<dynamic> GetEquipContacts(string IdUser)
        {
            List<Equip> equips = db.Equips.Where(e => e.Users.Any(u => u.ID == IdUser)).ToList();
            List<User> users = new List<User>();
            foreach (Equip equip in equips)
            {
                users.AddRange(equip.Users.Distinct());
            }
            users.Remove(db.Users.SingleOrDefault(u => u.ID == IdUser));
            return users.Select(u => new { id = u.ID, name = u.UserName, avatar = "https://ui-avatars.com/api/?name=" + u.UserName + "&rounded=true" });
        }

        // GET: les message de l'equip
        [HttpGet]
        [Route("api/chat/user/{IdUser}")]
        public dynamic GetUser(string IdUser)
        {
            return db.Users.Select(u => new { id = u.ID, name = u.UserName, avatar = "https://ui-avatars.com/api/?name=" + u.UserName + "&background=0D8ABC&color=fff&rounded=true" }).SingleOrDefault(u => u.id == IdUser);
        }

        [HttpPost]
        [Route("api/chat")]
        public dynamic PostConversation(Conversation conversation)
        {
            HttpResponseMessage response = new HttpResponseMessage();
            string id = Guid.NewGuid().ToString();

            try
            {
                if (db.Conversations.Any(c => ((c.IdUserCree == conversation.IdUserCree && c.IdUserContact == conversation.IdUserContact) || (c.IdUserCree == conversation.IdUserContact && c.IdUserContact == conversation.IdUserCree)) && c.Type == "Privé"))
                {
                    id = db.Conversations.SingleOrDefault(c => (c.IdUserCree == conversation.IdUserCree && c.IdUserContact == conversation.IdUserContact) || (c.IdUserCree == conversation.IdUserContact && c.IdUserContact == conversation.IdUserCree)).ID;
                }
                else
                {
                    string type;
                    if (conversation.Type == null)
                        type = !string.IsNullOrWhiteSpace(conversation.IdGroup) ? "Groupe" : !string.IsNullOrWhiteSpace(conversation.IdEquip) ? "Equipe" : "Privé";
                    else
                        type = conversation.Type;

                    conversation.Nom = type == "Privé" ? db.Users.SingleOrDefault(u => u.ID == conversation.IdUserCree).UserName + '-' + db.Users.SingleOrDefault(u => u.ID == conversation.IdUserContact).UserName : conversation.Nom;
                    if (conversation.ID == null)
                        conversation.ID = id;
                    conversation.Type = type;
                    conversation.LastMessageTime = DateTime.Now;
                    conversation.hasStream = false;
                    conversation.hasConference = false;
                    db.Conversations.Add(conversation);
                    db.SaveChanges();
                }
                return Request.CreateResponse(HttpStatusCode.Created, new
                {
                    success = true,
                    id,
                    msg = "Success post!"
                });
            }
            catch(Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, new
                {
                    success = false,
                    msg = ex.Message
                });
            }

        }

        [HttpPut]
        [Route("api/chat/{id}")]
        public IHttpActionResult PutConversation(string id, [FromBody] Conversation conversation)
        {
            conversation.LastMessageTime = DateTime.Now;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != conversation.ID)
            {
                return BadRequest();
            }

            db.Entry(conversation).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ConversationExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.OK);
        }


        [HttpPost]
        [Route("api/chat/message")]
        public HttpResponseMessage PostMessage(Message message)
        {
            HttpResponseMessage response = new HttpResponseMessage();
            string id = Guid.NewGuid().ToString();

            try
            {
                message.Id = id;
                //message.Time = DateTime.Now;
                db.Messages.Add(message);
                db.SaveChanges();

                return Request.CreateResponse(HttpStatusCode.Created, new
                {
                    success = true,
                    msg = "Success post"
                });
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, new
                {
                    success = false,
                    msg = "Faild to post message : " + ex
                });
            }

        }

        private bool ConversationExists(string id)
        {
            return db.Conversations.Count(e => e.ID == id) > 0;
        }
    }
}
