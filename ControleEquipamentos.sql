CREATE DATABASE ControleEquipamentos;

USE ControleEquipamentos;

CREATE TABLE Equipamentos (
    ID_Equipamento INT PRIMARY KEY IDENTITY(1,1),
    Nome VARCHAR(50) NOT NULL,
    Preco_Aquisicao DECIMAL(10, 2) NOT NULL,
    Numero_Serie VARCHAR(20) NOT NULL,
    Data_Fabricacao DATE NOT NULL,
    Fabricante VARCHAR(50) NOT NULL
);

CREATE TABLE Chamados (
    ID_Chamado INT PRIMARY KEY IDENTITY(1,1),
    Titulo VARCHAR(100) NOT NULL,
    Descricao TEXT,
    Equipamento_ID INT,
    Data_Abertura DATE NOT NULL,
    FOREIGN KEY (Equipamento_ID) REFERENCES Equipamentos(ID_Equipamento)
);

ALTER TABLE Chamados
ADD CONSTRAINT FK_Chamados_Equipamento_ID
FOREIGN KEY (Equipamento_ID) REFERENCES Equipamentos(ID_Equipamento) ON DELETE CASCADE;

SELECT * FROM Chamados;
SELECT * FROM Equipamentos;