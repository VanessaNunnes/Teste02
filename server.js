const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3300;

const config = {
    server: 'localhost',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: '123'
        }
    },
    options: {
        encrypt: false,
        database: 'ControleEquipamentos'
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastroEquipamentos.html'));
});

//------------------- EQUIPAMENTOS--------------------//

//---------------INSERIR EQUIPAMENTOS---------------//
app.post('/insert', async (req, res) => {
    const { Nome, Preco_Aquisicao, Numero_Serie, Data_Fabricacao, Fabricante } = req.body;

    await pool.request()
        .input('Nome', sql.VarChar(50), Nome)
        .input('Preco_Aquisicao', sql.Decimal(10, 2), Preco_Aquisicao)
        .input('Numero_Serie', sql.VarChar(20), Numero_Serie)
        .input('Data_Fabricacao', sql.Date, new Date(Data_Fabricacao))
        .input('Fabricante', sql.VarChar(50), Fabricante)
        .query('INSERT INTO Equipamentos (Nome, Preco_Aquisicao, Numero_Serie, Data_Fabricacao, Fabricante) VALUES (@Nome, @Preco_Aquisicao, @Numero_Serie, @Data_Fabricacao, @Fabricante);');

    res.redirect('/tabelaEquipamentos.html');
});
// -----------------------------------------------//


//---------------MOSTRAR EQUIPAMENTOS---------------//
app.get('/equipamentos', async (req, res) => {
    try {
        await pool.connect();
        const result = await pool.request().query('SELECT * FROM Equipamentos');
        const equipamentos = result.recordset;
        res.json(equipamentos);
    } catch (error) {
        console.error('Erro ao obter equipamentos:', error);
        res.status(500).send('Erro interno do servidor');
    }
});
// -----------------------------------------------//


//---------------EDITAR EQUIPAMENTOS---------------//
app.get('/editarEquipamentos/:id', async (req, res) => {
    const equipamentoId = req.params.id;

    try {
        await pool.connect();
        const result = await pool.request()
            .input('ID_Equipamento', sql.Int, equipamentoId)
            .query('SELECT * FROM Equipamentos WHERE ID_Equipamento = @ID_Equipamento');

        if (result.recordset.length > 0) {
            const equipamento = result.recordset[0];
            res.json(equipamento);
        } else {
            res.status(404).json({ error: 'Equipamento não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar informações do equipamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/edicoesEquipamentos/:id', async (req, res) => {
    const equipamentoId = req.params.id;

    const { ID_Equipamento, Nome, Preco_Aquisicao, Numero_Serie, Data_Fabricacao, Fabricante } = req.body;

    try {
        await pool.connect();

        const result = await pool.request()
            .input('ID_Equipamento', sql.Int, ID_Equipamento)
            .input('Nome', sql.VarChar, Nome)
            .input('Preco_Aquisicao', sql.Decimal(10, 2), Preco_Aquisicao)
            .input('Numero_Serie', sql.VarChar, Numero_Serie)
            .input('Data_Fabricacao', sql.Date, new Date(Data_Fabricacao))
            .input('Fabricante', sql.VarChar, Fabricante)
            .query(`
                UPDATE Equipamentos
                SET
                    Nome = @Nome,
                    Preco_Aquisicao = @Preco_Aquisicao,
                    Numero_Serie = @Numero_Serie,
                    Data_Fabricacao = @Data_Fabricacao,
                    Fabricante = @Fabricante
                WHERE ID_Equipamento = @ID_Equipamento
            `);

        if (result.rowsAffected[0] > 0) {
            res.redirect('/tabelaEquipamentos.html');
        } else {
            res.sendStatus(404); 
        }
    } catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// ----------------------------------------------- //


//---------------EXCLUIR EQUIPAMENTOS---------------//
app.delete('/excluir/:id', async (req, res) => {
    const equipamentoId = req.params.id;

    try {
        await pool.connect();
        const result = await pool.request()
            .input('ID_Equipamento', sql.Int, equipamentoId)
            .query('DELETE FROM Equipamentos WHERE ID_Equipamento = @ID_Equipamento');

        if (result.rowsAffected[0] > 0) {
            res.sendStatus(204);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Erro ao excluir equipamento:', error);
        res.status(500).send('Erro interno do servidor');
    }
});
// -----------------------------------------------//


//------------------- CHAMADOS --------------------//

//--------------- INSERIR CHAMADOS ---------------//
app.post('/registrarChamado', async (req, res) => {
    const { Titulo, Descricao, Equipamento_ID, Data_Abertura } = req.body;

    await poolConnect;

    const result = await pool.request()
        .input('Titulo', sql.VarChar(100), Titulo)
        .input('Descricao', sql.Text, Descricao)
        .input('Equipamento_ID', sql.Int, Equipamento_ID)
        .input('Data_Abertura', sql.DateTime, new Date(Data_Abertura))
        .query('INSERT INTO Chamados (Titulo, Descricao, Equipamento_ID, Data_Abertura) VALUES (@Titulo, @Descricao, @Equipamento_ID, @Data_Abertura);');

    res.redirect('/tabelaChamados.html');

});
// -----------------------------------------------//


//--------------- MOSTRAR CHAMADOS ---------------//
app.get('/chamados', async (req, res) => {
    try {
        await pool.connect();
        const result = await pool.request().query('SELECT * FROM Chamados');
        const chamados = result.recordset;
        res.json(chamados);
    } catch (error) {
        console.error('Erro ao obter chamados:', error);
        res.status(500).send('Erro interno do servidor');
    }
});
// -----------------------------------------------//


//--------------- EDIATR CHAMADOS ---------------//
app.get('/editarChamados/:id', async (req, res) => {
    const chamadoId = req.params.id;


    try {
        await pool.connect();
        const result = await pool.request()
            .input('ID_Chamado', sql.Int, chamadoId)
            .query('SELECT * FROM Chamados WHERE ID_Chamado = @ID_Chamado');


        if (result.recordset.length > 0) {
            const chamado = result.recordset[0];
            res.json(chamado);
        } else {
            res.status(404).json({ error: 'Chamado não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar informações do chamado:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


app.post('/edicoesChamados/:id', async (req, res) => {
    const chamadoId = req.params.id;

    const { ID_Chamado, Titulo, Descricao, Data_Abertura, Equipamento_ID } = req.body;

    try {
        await pool.connect();


        const result = await pool.request()
            .input('ID_Chamado', sql.Int, ID_Chamado)
            .input('Titulo', sql.VarChar, Titulo)
            .input('Descricao', sql.Text, Descricao)
            .input('Data_Abertura', sql.Date, new Date(Data_Abertura))
            .input('Equipamento_ID', sql.Int, Equipamento_ID)
            .query(`
                UPDATE Chamados
                SET
                    Titulo = @Titulo,
                    Descricao = @Descricao,
                    Data_Abertura = @Data_Abertura,
                    Equipamento_ID = @Equipamento_ID
                WHERE ID_Chamado = @ID_Chamado
            `);


        if (result.rowsAffected[0] > 0) {
            res.redirect('/tabelaChamados.html');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Erro ao atualizar chamado:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// -----------------------------------------------//


//--------------- EXCLUIR CHAMADOS ---------------//
app.delete('/excluirChamados/:id', async (req, res) => {
    const chamadoId = req.params.id;

    try {
        await pool.connect();
        const result = await pool.request()
            .input('ID_Chamado', sql.Int, chamadoId)
            .query('DELETE FROM Chamados WHERE ID_Chamado = @ID_Chamado');

        if (result.rowsAffected[0] > 0) {
            res.sendStatus(204);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Erro ao excluir chamado:', error);
        res.status(500).send('Erro interno do servidor');
    }
});
// -----------------------------------------------//










app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});