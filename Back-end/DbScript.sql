USE [master]
GO
/****** Object:  Database [TestApi]    Script Date: 19-06-2020 20:05:19 ******/
CREATE DATABASE [TestApi]
go

USE [TestApi]
GO

CREATE TABLE [dbo].[Conversation](
	[ID] [nvarchar](100) NOT NULL,
	[Type] [nvarchar](50) NULL,
	[Nom] [nvarchar](250) NULL,
	[IdEquip] [nvarchar](50) NULL,
	[IdGroup] [nvarchar](50) NULL,
	[IdUserCree] [nvarchar](50) NULL,
	[IdUserContact] [nvarchar](50) NULL,
	[LastMessage] [nvarchar](300) NULL,
	[LastMessageTime] [datetime] NULL,
	[hasStream] [bit] NULL,
	[streamId] [nvarchar](200) NULL,
	[hasConference] [bit] NULL,
	[conferenceId] [nvarchar](200) NULL,
 CONSTRAINT [PK_Conversation] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Equip]    Script Date: 19-06-2020 20:05:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Equip](
	[ID] [nvarchar](50) NOT NULL,
	[Nom] [nchar](10) NULL,
	[IdGroup] [nvarchar](50) NULL,
 CONSTRAINT [PK_Equip] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Group]    Script Date: 19-06-2020 20:05:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Group](
	[ID] [nvarchar](50) NOT NULL,
	[Nom] [nvarchar](50) NULL,
 CONSTRAINT [PK_Group] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Message]    Script Date: 19-06-2020 20:05:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Message](
	[Id] [nvarchar](100) NOT NULL,
	[IdUser] [nvarchar](50) NULL,
	[Time] [datetime] NULL,
	[Content] [nvarchar](400) NULL,
	[IdConversation] [nvarchar](100) NULL,
 CONSTRAINT [PK_Message] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MyFiles]    Script Date: 19-06-2020 20:05:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MyFiles](
	[FileName] [nvarchar](200) NOT NULL,
	[ModifiedDate] [datetime] NULL,
	[FileServerName] [nvarchar](200) NULL,
	[IdGroup] [nvarchar](50) NULL,
	[IdEquip] [nvarchar](50) NULL,
	[Type] [nvarchar](50) NULL,
	[ForGroup] [bit] NULL,
 CONSTRAINT [PK_MyFiles] PRIMARY KEY CLUSTERED 
(
	[FileName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User]    Script Date: 19-06-2020 20:05:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User](
	[ID] [nvarchar](50) NOT NULL,
	[UserName] [nvarchar](50) NULL,
	[Password] [nvarchar](50) NULL,
 CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserEquip]    Script Date: 19-06-2020 20:05:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserEquip](
	[IdUser] [nvarchar](50) NOT NULL,
	[IdEquipe] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_UserEquip] PRIMARY KEY CLUSTERED 
(
	[IdUser] ASC,
	[IdEquipe] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Conversation]  WITH CHECK ADD  CONSTRAINT [FK_Conversation_Equip] FOREIGN KEY([IdEquip])
REFERENCES [dbo].[Equip] ([ID])
GO
ALTER TABLE [dbo].[Conversation] CHECK CONSTRAINT [FK_Conversation_Equip]
GO
ALTER TABLE [dbo].[Conversation]  WITH CHECK ADD  CONSTRAINT [FK_Conversation_Group] FOREIGN KEY([IdGroup])
REFERENCES [dbo].[Group] ([ID])
GO
ALTER TABLE [dbo].[Conversation] CHECK CONSTRAINT [FK_Conversation_Group]
GO
ALTER TABLE [dbo].[Conversation]  WITH CHECK ADD  CONSTRAINT [FK_Conversation_User] FOREIGN KEY([IdUserCree])
REFERENCES [dbo].[User] ([ID])
GO
ALTER TABLE [dbo].[Conversation] CHECK CONSTRAINT [FK_Conversation_User]
GO
ALTER TABLE [dbo].[Conversation]  WITH CHECK ADD  CONSTRAINT [FK_Conversation_User1] FOREIGN KEY([IdUserContact])
REFERENCES [dbo].[User] ([ID])
GO
ALTER TABLE [dbo].[Conversation] CHECK CONSTRAINT [FK_Conversation_User1]
GO
ALTER TABLE [dbo].[Equip]  WITH CHECK ADD  CONSTRAINT [FK_Equip_Group] FOREIGN KEY([IdGroup])
REFERENCES [dbo].[Group] ([ID])
GO
ALTER TABLE [dbo].[Equip] CHECK CONSTRAINT [FK_Equip_Group]
GO
ALTER TABLE [dbo].[Message]  WITH CHECK ADD  CONSTRAINT [FK_Message_Conversation] FOREIGN KEY([IdConversation])
REFERENCES [dbo].[Conversation] ([ID])
GO
ALTER TABLE [dbo].[Message] CHECK CONSTRAINT [FK_Message_Conversation]
GO
ALTER TABLE [dbo].[Message]  WITH CHECK ADD  CONSTRAINT [FK_Message_User] FOREIGN KEY([IdUser])
REFERENCES [dbo].[User] ([ID])
GO
ALTER TABLE [dbo].[Message] CHECK CONSTRAINT [FK_Message_User]
GO
ALTER TABLE [dbo].[MyFiles]  WITH CHECK ADD  CONSTRAINT [FK_MyFiles_Equip] FOREIGN KEY([IdEquip])
REFERENCES [dbo].[Equip] ([ID])
GO
ALTER TABLE [dbo].[MyFiles] CHECK CONSTRAINT [FK_MyFiles_Equip]
GO
ALTER TABLE [dbo].[MyFiles]  WITH CHECK ADD  CONSTRAINT [FK_MyFiles_Group] FOREIGN KEY([IdGroup])
REFERENCES [dbo].[Group] ([ID])
GO
ALTER TABLE [dbo].[MyFiles] CHECK CONSTRAINT [FK_MyFiles_Group]
GO
ALTER TABLE [dbo].[UserEquip]  WITH CHECK ADD  CONSTRAINT [FK_UserEquip_Equip] FOREIGN KEY([IdEquipe])
REFERENCES [dbo].[Equip] ([ID])
GO
ALTER TABLE [dbo].[UserEquip] CHECK CONSTRAINT [FK_UserEquip_Equip]
GO
ALTER TABLE [dbo].[UserEquip]  WITH CHECK ADD  CONSTRAINT [FK_UserEquip_User] FOREIGN KEY([IdUser])
REFERENCES [dbo].[User] ([ID])
GO
ALTER TABLE [dbo].[UserEquip] CHECK CONSTRAINT [FK_UserEquip_User]
GO
USE [master]
GO
ALTER DATABASE [TestApi] SET  READ_WRITE 
GO
